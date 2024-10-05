// Function to add two numbers
function addNumbers(a, b) {
    return a + b;
}
// Function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// Function to check if a number is even
function isEven(num) {
    return num % 2 === 0;
}
// Function to reverse a string
function reverseString(str) {
    return str.split('').reverse().join('');
}
// Test the functions
const num1 = 5;
const num2 = 10;
console.log(`The sum of ${num1} and ${num2} is: ${addNumbers(num1, num2)}`);
const testString = 'hello world';
console.log(`Capitalized: ${capitalizeFirstLetter(testString)}`);
const testNumber = 4;
console.log(`${testNumber} is even: ${isEven(testNumber)}`);
const reversed = reverseString(testString);
console.log(`Reversed string: ${reversed}`);
