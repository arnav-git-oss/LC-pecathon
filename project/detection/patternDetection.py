import re

VERHOEFF_MULTIPLICATION = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

VERHOEFF_PERMUTATION = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

VERHOEFF_INVERSE = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]


def validate_aadhaar(uid: str) -> bool:
    uid_clean = uid.replace(" ", "")
    
    if not uid_clean.isdigit() or len(uid_clean) != 12:
        return False
    
    check = 0
    for i, digit in enumerate(reversed(uid_clean)):
        p = VERHOEFF_PERMUTATION[i % 8][int(digit)]
        check = VERHOEFF_MULTIPLICATION[check][p]
    
    return check == 0

def validate_pan(panCardNo):

    regex = "[A-Z]{5}[0-9]{4}[A-Z]{1}"

    p = re.compile(regex)

    if(panCardNo == None):
        return False

    if(re.search(p, panCardNo) and
       len(panCardNo) == 10):
        return True
    else:
        return False

#TODO:Email Validation

def validate_phone(s):
    n = len(s)  
    for ch in s:
        if not ch.isdigit():
            return False    
    if n == 10:
        return s[0] in "789"    
    if n == 11:
        return s[0] == '0' and s[1] in "789"    
    if n == 12:
        return s[0] == '9' and \
            s[1] == '1' and \
            s[2] in "789"   
    return False

def checkLuhn(cardNo):
    
    nDigits = len(cardNo)
    nSum = 0
    isSecond = False
    
    for i in range(nDigits - 1, -1, -1):
        d = ord(cardNo[i]) - ord('0')
    
        if (isSecond == True):
            d = d * 2

        nSum += d // 10
        nSum += d % 10
 
        isSecond = not isSecond
    
    if (nSum % 10 == 0):
        return True
    else:
        return False

