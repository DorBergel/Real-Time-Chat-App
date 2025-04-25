

exports.isAdult = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--; // Adjust age if birthday hasn't occurred yet this year
    }

    return age >= 18;
}

exports.passwordIsStrong = (pass) => {
    /*
    Requires:
    - 8 <= pass <= 16
    - include Upper/Lower Case 
    - include number 0-9
    - include sign
    */ 
    const lengthValid = pass.length >= 8 && pass.length <= 16;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    return lengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}