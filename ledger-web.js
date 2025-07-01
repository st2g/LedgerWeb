// "use strict";
console.log("I'm Alive");

//////////////////////////////////////////////////////////////
// Main Variables
//////////////////////////////////////////////////////////////
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
const xtraAccounts = [];
const accountInputs = document.getElementsByClassName("account_input");
const accountsList = document.getElementById("accountsList");
// Payee Info
const payees = [];
const xtraPayees = [];
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
const copyXtrasButton = document.getElementById("copy-xtras");

//////////////////////////////////////////////////////////////
// Functions
//////////////////////////////////////////////////////////////

// Upload definition file button/function
definitionUpload.addEventListener('change', async () => {
    if (definitionUpload.files.length == 1) {
        let [file] = definitionUpload.files;
        const contents = await file.text();
        parseDefinitionContents(contents);
    }
})

// Parse contents of definition file - Extract Payees and Accounts
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

// Add Payees to drop down list
function addPayees() {
    payees.sort();
    // Clear current Payees list
    payeeList.innerHTML = '';
    // Repopulate Payees list
    for (let x of payees) {
        if (!payeeList.innerHTML.includes(`<option>${x}</option>`)) {
            payeeList.innerHTML += `<option>${x}</option>`;
        }
    }
}

// Add Accounts to drop down list
function addAccounts() {
    accounts.sort();
    // Clear Accounts lists
    accountsList.innerHTML = '';
    // Populate Accounts lists
    for (let y of accounts) {
        if (!accountsList.innerHTML.includes(`<option>${y}</option>`)) {
            accountsList.innerHTML += `<option>${y}</option>`;
        }
    }
}

// Function to remove an entry - either processed or account line
function removeEntry(e) {
    let entryToRemove = document.getElementById(e);
    entryToRemove.outerHTML = '';
}

// Helper function to select the text in a box when clicked
function selectEntry(e) {
    e.target.select();
}

// Add new Account and Entry line
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
    let entryHTMLString = `<span id="input_line_${lineNum}">`;
    entryHTMLString += `<i class="fa-solid fa-minus" style="cursor: pointer;" onclick="removeEntry('input_line_${lineNum}')"></i>\n`;
    entryHTMLString += `<i class="fa-solid fa-plus" style="cursor: pointer;" onclick="addLineItem()"></i>\n`;
    entryHTMLString += `<input name="account-input_${lineNum}" id="account_${lineNum}" class="account_input" list="accountsList" onclick="this.select()"/>\n`;
    entryHTMLString += `<input name="amount_${lineNum}" type="number" class="amount" /><br /></span>\n`;
    extraEntries.innerHTML += entryHTMLString;
    // Set original values back
    for (let i = 0; i < accountInputs.length - 1; i++) {
        accountInputs[i].value = originalValues[i].a
        entryAmounts[i].value = originalValues[i].e;
    }
}

// Process the text in the Payee, Accounts, and Amounts lines
processButton.addEventListener('click', async () => {
    // Add the results text
    let date;
    const [payeesCount, accountsCount] = [xtraPayees.length, xtraAccounts.length];
    if (dateArea.value) { date = dateArea.value.replaceAll('-','/'); }
    else {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        date = `${yyyy}/${mm}/${dd}`;
    }
    let payee = payeeInput.value;
    let checkNumber = parseInt(checkNum.value);
    const entries = [];
    let emptyAmounts = 0;
    let validEntry = true;
    let entryString;
    for (let i = 0; i < accountInputs.length; i++) {
        if (accountInputs[i].value.trim() === '') { validEntry = false; }
        if (entryAmounts[i].value === '') { emptyAmounts++; }
        entries.push({
            account: accountInputs[i].value,
            amount: entryAmounts[i].value !== '' ?
                parseFloat(entryAmounts[i].value).toFixed(2) :
                ''
        });
        // Add account to extra accounts list
        if (accounts.findIndex((z) => { return accountInputs[i].value === z }) == -1) {
            xtraAccounts.push(accountInputs[i].value);
            accounts.push(accountInputs[i].value);
        }
    }

    if (payee.trim() === '') { validEntry = false; }
    if (!validEntry) { alert("Invalid entry") }
    else {
        if (emptyAmounts > 1) { alert("Invalid entry: Empty amounts cannot excede 1"); }
        else {
            // Add Payee to extra Payees list
            if (payees.findIndex((z) => { return payee === z }) == -1) {
                xtraPayees.push(payee);
                payees.push(payee);
            }
            // Find a way to modify this to add paired entries (PayPal, Redcard)
            entryString = checkNumber ?
                `${date} (${checkNumber}) ${payee}\n` :
                `${date} ${payee}\n`;
            let totalAmount = parseFloat(0);
            for (let x of entries) {
                totalAmount += x.amount ? parseFloat(x.amount) : parseFloat(0);
                entryString += x.amount ?
                    `    ${x.account}  $${x.amount}\n` :
                    `    ${x.account}\n`;
            }
            // Find if RedCard Matches entryString
            if (entryString.match(/RedCard/g)) {
                entryString += `\n${date} RedCard Payment\n`;
                entryString += `    Liabilities:Store Card:RedCard  $${parseFloat(totalAmount).toFixed(2)}\n`;
                entryString += `    Assets:Banking:Wells Fargo\n`
            }
            if (entryString.match(/PayPal/g)) {
                entryString += `\n${date} PayPal Payment\n`;
                entryString += `    Assets:Banking:PayPal  $${parseFloat(totalAmount).toFixed(2)}\n`;
                entryString += `    Assets:Banking:Wells Fargo\n`
            }
            textArea.innerHTML += `<span id="entry_${++entryNum}"><pre>${entryString}</pre><button onclick="removeEntry('entry_${entryNum}')">Remove Above Entry</button><br></span>`;
            // If we added any payees or accounts, add them to the dropdown for future use
            if (payeesCount < xtraPayees.length || accountsCount < xtraAccounts.length) {
                addAccounts();
                addPayees();
            }
        }
    }
});

// Function to clear processed transactions area
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

// Function to clean up HTML from processed transactions and copy to clipboard
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

// Listener to show or hide Check Number input
checkBox.addEventListener('click', () => {
    checkNum.value = '';
    checkNum.style.display = checkBox.checked == false ?
        "none" :
        "inline";
})

// Listener to copy Xtra lists to clipboard, formatted properly
copyXtrasButton.addEventListener('click', () => {
    // Logic to copy new payees and accounts to clipboard
    let copiedText = '';
    for (let x of xtraAccounts) { copiedText += `account ${x}\n`; }
    for (let x of xtraPayees) { copiedText += `payee ${x}\n`; }
    navigator.clipboard.writeText(copiedText);
})

// Listener to allow the Enter key from Amount fields to process xact
for (let x of entryAmounts) {
    x.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            processButton.click();
        }
    })
}
