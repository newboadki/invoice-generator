function main() {
  replace('',                            // Invoice name
          'dd/MM/yyyy',                  // Date
          '',                            // Invoice number
          /*<value>*/,                   // Exchange rate
          /*<value>*/);                  // EUR amount
}

function replace(name, date, invoiceNumber, eurToTargetCurrencyRate, eurPrice) {

  var files = DriveApp.getFilesByName('Invoice Template');
  while (files.hasNext()) {
    var file = files.next();

    // Get a copy of the template
    var copy = file.makeCopy(name + " - " + date);
    var copyId = copy.getId();
    var invoice = DocumentApp.openById(copyId);
    var invoiceBody = invoice.getBody();

    // Replace placeholders
    invoiceBody.replaceText('{date}', date);
    invoiceBody.replaceText('{id}', invoiceNumber);
    invoiceBody.replaceText('{rate}', eurToTargetCurrencyRate);
    invoiceBody.replaceText('{eur-price}', formatCurrency('€', eurPrice));
    invoiceBody.replaceText('{hrk-price}', formatCurrency('<Target-currency-symbol>', eurPrice * eurToTargetCurrencyRate));
    invoice.saveAndClose();

    // Create PDF & delete copy
    DriveApp.createFile(copy.getAs('application/pdf'));
    copy.setTrashed(true);

    // Send an email with attachment
    MailApp.sendEmail('<email-address>', (name + " " + date), 'Hi, please find attached the invoice for this month. Thanks.', {
                      name: "<name>",
                      attachments: [copy.getAs(MimeType.PDF)]
    });
  }
}

function formatCurrency(symbol, amount) {
  var aDigits = amount.toFixed(2).split(".");
  aDigits[0] = aDigits[0].split("").reverse().join("")
    .replace(/(\d{3})(?=\d)/g,"$1,").split("").reverse().join("");
  return aDigits.join(".") + " " + symbol;
}
