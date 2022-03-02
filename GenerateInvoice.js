function main() {
  replace('Test invoice',         // Invoice title
          'test@email.com',       // Sender's email
          'Roger That',           // Sender's name
          '01/01/1999',           // Date
          '2-1-1',                // Invoice number
          7.56,                   // Base to target Exchange rate
          'Kn',                   // Target currency symbol
          1000,                   // Base currency amount
          '€');                   // Base currency symbol
}

function replace(invoiceTitle, senderEmail, senderName, date, invoiceNumber, baseToTargetCurrencyRate, targetCurrencySymbol, baseCurrencyAmount, baseCurrencySymbol) {

  var files = DriveApp.getFilesByName('Invoice Template');
  while (files.hasNext()) {
    var file = files.next();

    // Get a copy of the template
    var copy = file.makeCopy(invoiceTitle + " - " + date);
    var copyId = copy.getId();
    var invoice = DocumentApp.openById(copyId);
    var invoiceBody = invoice.getBody();

    // Replace placeholders
    invoiceBody.replaceText('{date}', date);
    invoiceBody.replaceText('{id}', invoiceNumber);
    invoiceBody.replaceText('{rate}', baseToTargetCurrencyRate);
    invoiceBody.replaceText('{base-price}', formatCurrency(baseCurrencySymbol, baseCurrencyAmount));
    invoiceBody.replaceText('{target-price}', formatCurrency(targetCurrencySymbol, baseCurrencyAmount * baseToTargetCurrencyRate));
    invoice.saveAndClose();

    // Create PDF & delete copy
    DriveApp.createFile(copy.getAs('application/pdf'));
    copy.setTrashed(true);

    // Send an email with attachment
    MailApp.sendEmail(senderEmail, (invoiceTitle + " " + date), 'Hi, please find attached the invoice for this month. Thanks.', {
                      name: senderName,
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
