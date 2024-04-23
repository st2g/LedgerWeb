// "use strict";
console.log("I'm Alive");

let entryNum = 0;
const textArea = document.getElementById("results");
let lineNum = 10;
const extraEntries = document.getElementById("xtra-entries");
// Date Picker
const dateArea = document.getElementById("the-date");
// File Picker
const definitionPicker = document.getElementById("defs");
const definitionUpload = document.getElementById("def-upload");
// Account Info
const accounts = [];
const accountInputs = document.getElementsByClassName("account_input");
const accountsList = document.getElementById("accountsList");
// Payee Info
const payees = [];
const payeeInput = document.getElementById("payee-input");
const payeeList = document.getElementById("payeeList");
// Amount Entries
const entryAmounts = document.getElementsByClassName("amount");
// Check Numbers
const checkBox = document.getElementById("allowCheck");
const checkNum = document.getElementById("check");
checkNum.style.display = "none";
// Buttons
const processButton = document.getElementById("process-entry");
const clearButton = document.getElementById("clear-results");
const copyButton = document.getElementById("copy-results");

definitionUpload.addEventListener('change', async () => {
    if (definitionUpload.files.length == 1) {
        let [file] = definitionUpload.files;
        const contents = await file.text();
        parseDefinitionContents(contents);
    }
})

let debug;
function parseDefinitionContents(contents) {
    // Match until semicolon or end of line
    const payeesRe = /^payee\s(\S.*?(?=;|$))/;
    const accountsRe = /^account\s(\S.*?(?=;|$))/;

    lines = contents.split(/\r?\n/);
    for (let x of lines) {
        // Get Payees from each line
        let result = x.match(payeesRe);
        if (result) {
            // Add to payees Array
            if (payees.findIndex((z) => { return result[1].trim() === z }) == -1) {
                payees.push(result[1].trim());
            }
        }
        // Get Accounts from each line
        result = x.match(accountsRe);
        if (result) {
            // Add to accounts Array
            if (accounts.findIndex((z) => { return result[1].trim() === z }) == -1) {
                accounts.push(result[1].trim());
            }
        }
    }
    addPayees();
    addAccounts();
}

function addPayees() {
    payees.sort();
    // Clear current Payees list
    payeeList.innerHTML = '';
    // Repopulate Payees list
    for (let x of payees) {
        if (!payeeList.innerHTML.includes('<option>' + x + '</option>')) {
            payeeList.innerHTML += '<option>' + x + '</option>';
        }
    }
}

function addAccounts() {
    accounts.sort();
    // Clear Accounts lists
    accountsList.innerHTML = '';
    // Populate Accounts lists
    for (let y of accounts) {
        if (!accountsList.innerHTML.includes('<option>' + y + '</option>')) {
            accountsList.innerHTML += '<option>' + y + '</option>';
        }
    }
}


let entryToRemove;
function removeEntry(e) {
    entryToRemove = document.getElementById(e);
    entryToRemove.outerHTML = '';
}

function selectEntry(e) {
    e.target.select();
}

function addLineItem() {
    lineNum++;
    // Get original values
    let originalValues = new Array(accountInputs.length);
    for (let i = 0; i < accountInputs.length; i++) {
        originalValues[i] = {
            a: accountInputs[i].value,
            e: entryAmounts[i].value
        }
    }
    let entryHTMLString = '<span id="input_line_' + lineNum + '">';
    entryHTMLString += '<i class="fa-solid fa-minus" style="cursor: pointer;" onclick="removeEntry(' + "'input_line_" + lineNum + "'" + ')"></i>\n';
    entryHTMLString += '<i class="fa-solid fa-plus" style="cursor: pointer;" onclick="addLineItem()"></i>\n';
    entryHTMLString += '<input name="account-input_' + lineNum + '" id="account_' + lineNum + '" class="account_input" list="accountsList" onclick="this.select()"/>\n';
    entryHTMLString += '<input name="amount_' + lineNum + '" type="number" class="amount" /><br /></span>\n';
    extraEntries.innerHTML += entryHTMLString;
    // Set original values back
    for (let i = 0; i < accountInputs.length - 1; i++) {
        accountInputs[i].value = originalValues[i].a
        entryAmounts[i].value = originalValues[i].e;
    }
}

let entryString;

processButton.addEventListener('click', async () => {
    // Add the results text
    let date;
    if (dateArea.value) { date = dateArea.value; }
    else {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        date = `${yyyy}-${mm}-${dd}`;
    }
    let payee = payeeInput.value;
    let checkNumber = parseInt(checkNum.value);
    const entries = [];
    let emptyAmounts = 0;
    let validEntry = true;
    for (let i = 0; i < accountInputs.length; i++) {
        if (accountInputs[i].value.trim() === '') { validEntry = false; }
        if (entryAmounts[i].value === '') { emptyAmounts++; }
        entries.push({
            account: accountInputs[i].value,
            amount: entryAmounts[i].value !== '' ?
                parseFloat(entryAmounts[i].value).toFixed(2) :
                ''
        });
    }

    if (payee.trim() === '') { validEntry = false; }
    if (!validEntry) { alert("Invalid entry") }
    else {
        if (emptyAmounts > 1) { alert("Invalid entry: Empty amounts cannot excede 1"); }
        else {
            entryString = checkNumber ?
                `${date} (${checkNumber}) ${payee}\n` :
                `${date} ${payee}\n`;
            for (let x of entries) {
                entryString += x.amount ?
                    `    ${x.account}  $${x.amount}\n` :
                    `    ${x.account}\n`;
            }
            textArea.innerHTML += '<span id="entry_' + ++entryNum + '"><pre>' + entryString + '</pre><button onclick="removeEntry(' + "'entry_" + entryNum + "'" + ')">Remove Above Entry</button><br></span>';
        }
    }
});

clearButton.addEventListener('click', () => {
    // Clear the results text
    if (confirm("Are you sure you want to clear the results?")) {
        // Clear results pane
        textArea.innerHTML = '';
        // Clear entered amounts
        for (let x of entryAmounts) { x.value = ''; }
        // Reset entry number
        entryNum = 0;
    }
})

copyButton.addEventListener('click', () => {
    // Copy results text to the clipboard
    let copiedText = textArea.innerHTML;
    // Remove <pre> tags from HTML
    copiedText = copiedText.replace(/<\/?pre>/g, '');
    // Remove <span> tags
    copiedText = copiedText.replace(/<span id=.*?>/g, '');
    copiedText = copiedText.replace(/<\/span>/g, '');
    // Remove <button>s
    copiedText = copiedText.replace(/<button.*?<\/button>/g, '');
    // Remove <br> tags from HTML and replace with new line
    copiedText = copiedText.replace(/<br>/g, '\n');
    navigator.clipboard.writeText(copiedText);
})

checkBox.addEventListener('click', () => {
    checkNum.value = '';
    checkNum.style.display = checkBox.checked == false ?
        "none" :
        "inline";
})
