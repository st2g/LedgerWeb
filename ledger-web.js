// "use strict";
console.log("I'm Alive");

const textArea = document.getElementById("results");
const extraEntries = document.getElementById("xtra-entries");
const dateArea = document.getElementById("the-date");
const definitionPicker = document.getElementById("defs");
const definitionUpload = document.getElementById("def-upload");
// const ledgerPicker = document.getElementById("ledger-file");
const payeeOptions = document.getElementById("payee-select");
const accountOptions = document.getElementsByClassName("account");
const entryAmounts = document.getElementsByClassName("amount");
const accountOthers = document.getElementsByClassName("amount_other");
const checkNum = document.getElementById("check");
checkNum.style.display = "none";
const processButton = document.getElementById("process-entry");
const clearButton = document.getElementById("clear-results");
const payeeOther = document.getElementById("payee-other");
const copyButton = document.getElementById("copy-results");
const checkBox = document.getElementById("allowCheck");
const payees = [];
const accounts = [];
let entryNum = 0;
let lineNum = 10;
// let lines;

definitionUpload.addEventListener('change', async () => {
    if (definitionUpload.files.length == 1) {
        // console.log('File uploaded: ', definitionUpload.files[0]);
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
        // console.log(x);
        // Get Payees from each line
        let result = x.match(payeesRe);
        if (result) {
            // Add to payees Array
            debug = [result[1].trim(), payees];
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
    for (let z of accountOptions) { addAccounts(z) }
    // addAccounts();
    // payees.sort();
    // // Clear current Payees list
    // for (let i = payeeOptions.length; i > 0; i--) { payeeOptions.remove(i); }
    // // Repopulate Payees list
    // for (let x of payees) { payeeOptions.add(new Option(x, undefined)); }
    // accounts.sort();
    // for (let z of accountOptions) {
    //     // Clear Accounts lists
    //     for (let y = z.length; y > 0; y--) { z.remove(y); }
    //     // Populate Accounts lists
    //     for (let y of accounts) { z.add(new Option(y, undefined)); }
    // }
}

function addPayees() {
    payees.sort();
    // Clear current Payees list
    for (let i = payeeOptions.length; i > 0; i--) { payeeOptions.remove(i); }
    // Repopulate Payees list
    for (let x of payees) { payeeOptions.add(new Option(x, undefined)); }
}

function addAccounts(e) {
    accounts.sort();
    // Clear Accounts lists
    for (let y = e.length; y > 0; y--) { e.remove(y); }
    // Populate Accounts lists
    for (let y of accounts) { e.add(new Option(y, undefined)); }
}


let entryToRemove;
function removeEntry(e) {
    entryToRemove = document.getElementById(e);
    entryToRemove.outerHTML = '';
    updateAccountOptionsStyle();
}

function addLineItem() {
    lineNum++;
    let entryHTMLString = '<span id="input_line_' + lineNum + '">';
    entryHTMLString += '<i class="fa-solid fa-minus" style="cursor: pointer;" onclick="removeEntry(' + "'input_line_" + lineNum + "'" + ')"></i>\n';
    entryHTMLString += '<i class="fa-solid fa-plus" style="cursor: pointer;" onclick="addLineItem()"></i>\n';
    entryHTMLString += '<select name="account_' + lineNum + '" id="account_' + lineNum + '" class="account">\n<option>Other</option>\n</select>\n';
    entryHTMLString += '<input name="account_other_' + lineNum + '" id="account_other_' + lineNum + '"  class="amount_other" />\n';
    entryHTMLString += '<input name="amount_' + lineNum + '" type="number" class="amount" /><br /></span>\n';
    extraEntries.innerHTML += entryHTMLString;

    const myNewLine = document.getElementById('account_' + lineNum);
    addAccounts(myNewLine);
    // TODO: Fix this. Only will change the most recent line that is lineNum
    updateAccountOptionsStyle();
}

// let test;
let entryString;

// document.addEventListener()
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
    let payee = payeeOptions.value === 'Other' ?
        payeeOther.value.trim() :
        payeeOptions.value;
    let checkNumber = parseInt(checkNum.value);
    const entries = [];
    let emptyAmounts = 0;
    let validEntry = true;
    for (let i = 0; i < accountOptions.length; i++) {
        if (accountOptions[i].value.trim() === '') { validEntry = false; }
        if (accountOptions[i].value === 'Other' && accountOthers[i].value.trim() === '') { validEntry = false; };
        if (entryAmounts[i].value === '') { emptyAmounts++; }
        entries.push({
            account: accountOptions[i].value === 'Other' ?
                accountOthers[i].value.trim() :
                accountOptions[i].value,
            amount: entryAmounts[i].value !== '' ?
                parseFloat(entryAmounts[i].value).toFixed(2) :
                ''
        });
    }

    if (payee.trim() === '') { validEntry = false; }
    // console.log(emptyAmounts);
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
            // console.log(entryString);
            textArea.innerHTML += '<span id="entry_' + ++entryNum + '"><pre>' + entryString + '</pre><button onclick="removeEntry(' + "'entry_" + entryNum + "'" + ')">Remove Above Entry</button><br></span>';
            // textArea.innerHTML += '<pre>' + entryString + '</pre><br>';
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
        // Clear accounts
        for (let x of accountOptions) { x.value = ''; }
        for (let x of accountOthers) {
            x.value = '';
            x.style.display = 'none';
        }
        // Clear Payee
        payeeOptions.value = '';
        payeeOther.value = '';
        payeeOther.style.display = 'none';
        // Clear Check Number
        checkNum.value = '';
        // Clear the Date
        dateArea.value = '';
        // Reset entry number
        entryNum = 0;
    }
    // else {textArea.innerHTML=e;}
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

payeeOptions.addEventListener('change', () => {
    payeeOther.style.display = payeeOptions.value === 'Other' ?
        "inline" :
        'none';
})

function updateAccountOptionsStyle() {
    for (let i = 0; i < accountOptions.length; i++) {
        // function changeOptions(){
        //     accountOthers[i].style.display = accountOptions[i].value === 'Other' ?
        //     'inline' :
        //     'none';
        // }
        // accountOptions[i].removeEventListener('change', changeOptions);
        let old_elem = accountOptions[i];
        let new_elem = old_elem.cloneNode(true);
        old_elem.parentNode.replaceChild(new_elem, old_elem);
        accountOptions[i].addEventListener('change', () => {
            accountOthers[i].style.display = accountOptions[i].value === 'Other' ?
                'inline' :
                'none';
        });
    }
}
updateAccountOptionsStyle();
