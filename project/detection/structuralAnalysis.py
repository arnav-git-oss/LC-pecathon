import asyncio
import re
from playwright.async_api import async_playwright

# 1. Define privacy-sensitive keywords and patterns
SENSITIVE_PATTERNS = [
    r"password", r"passwd", r"secret", r"token", r"api[_-]?key",
    r"ssn", r"social[_-]?sec", r"credit[_-]?card", r"card[_-]?num", r"cvv", r"cvc",
    r"phone", r"mobile", r"tel", r"email",
    r"address", r"street", r"zip", r"postal",
    r"dob", r"birth", r"age", r"bank", r"account", r"routing"
]

# 2. Define standard sensitive autocomplete attributes (HTML5 spec)
SENSITIVE_AUTOCOMPLETE = {
    "current-password", "new-password", "cc-number", "cc-csc", 
    "cc-exp", "cc-name", "tel", "email", "street-address", 
    "postal-code", "bday", "username"
}

async def inspect_webpage_privacy(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print(f"[*] Navigating and scanning: {url}\n")
        await page.goto(url)
        
        # ==========================================
        # LAYER 1: DOM Elements & Metadata Inspection
        # ==========================================
        fields = await page.query_selector_all("input, select, textarea")
        print(f"=== DOM Metadata Analysis ({len(fields)} form elements found) ===")
        
        for idx, field in enumerate(fields):
            tag_name = await field.evaluate("el => el.tagName.toLowerCase()")
            field_type = await field.get_attribute("type") or "text"
            name = await field.get_attribute("name") or ""
            field_id = await field.get_attribute("id") or ""
            autocomplete = await field.get_attribute("autocomplete") or ""
            placeholder = await field.get_attribute("placeholder") or ""
            aria_label = await field.get_attribute("aria-label") or ""
            
            # Aggregate attributes into a string for heuristic evaluation
            metadata_string = f"{name} {field_id} {autocomplete} {placeholder} {aria_label}".lower()
            
            is_sensitive = False
            reasons = []
            
            # Check HTML structure & metadata rules
            if field_type == "password":
                is_sensitive = True
                reasons.append("Input type explicitly set to 'password'")
                
            if autocomplete in SENSITIVE_AUTOCOMPLETE:
                is_sensitive = True
                reasons.append(f"Contains sensitive autocomplete tag: '{autocomplete}'")
                
            for pattern in SENSITIVE_PATTERNS:
                if re.search(pattern, metadata_string):
                    is_sensitive = True
                    reasons.append(f"Matched sensitive keyword pattern: '{pattern}'")
                    break
                    
            if is_sensitive:
                print(f"[!] Sensitive Field Found [DOM Index: {idx}]")
                print(f"    • Element: <{tag_name} type='{field_type}'>")
                print(f"    • Identifiers: id='{field_id}' | name='{name}'")
                print(f"    • Autocomplete: '{autocomplete}'")
                print(f"    • Trigger Reason(s): {', '.join(reasons)}")
                print("-" * 55)

        # ==========================================
        # LAYER 2: Accessibility (AX) Tree Inspection
        # ==========================================
        print("\n=== Accessibility Tree Analysis ===")
        ax_tree = await page.accessibility.snapshot() # Grabs Chromium's accessibility tree
        
        def traverse_ax_tree(node):
            if not node:
                return
            role = node.get("role", "")
            name = node.get("name", "")
            description = node.get("description", "")
            
            node_semantics = f"{name} {description}".lower()
            
            # Check if accessibility text/labels leak or expose sensitive information
            for pattern in SENSITIVE_PATTERNS:
                if re.search(pattern, node_semantics):
                    print(f"[!] Sensitive Accessibility Node Found:")
                    print(f"    • Role: '{role}'")
                    print(f"    • Accessible Name: '{name}'")
                    print(f"    • Description: '{description}'")
                    print(f"    • Matched Pattern: '{pattern}'")
                    print("-" * 45)
                    break
                    
            for child in node.get("children", []):
                traverse_ax_thread = traverse_ax_tree(child)

        if ax_tree:
            traverse_ax_tree(ax_tree)
            
        await browser.close()

if __name__ == "__main__":
    # Example target test URL (replace with target application)
    asyncio.run(inspect_webpage_privacy("https://example.com/login"))