// copyCode.js

var CodeCopy = (function () {
    function copyCode(elementId) {
        /* Get the text content of the specified element */
        var codeText = document.getElementById(elementId).innerText;

        /* Create a temporary textarea to hold the code text */
        var tempTextArea = document.createElement("textarea");
        tempTextArea.value = codeText;

        /* Append the textarea to the body */
        document.body.appendChild(tempTextArea);

        /* Select the text in the textarea */
        tempTextArea.select();
        tempTextArea.setSelectionRange(0, 99999);

        /* Copy the text to the clipboard */
        document.execCommand("copy");

        /* Remove the temporary textarea */
        document.body.removeChild(tempTextArea);

        /* Provide some visual feedback */
        alert("Code copied to clipboard!");
    }

    return {
        copyCode: copyCode
    };
})();
