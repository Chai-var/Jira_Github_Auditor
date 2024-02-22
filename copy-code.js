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

        /* Create a message element if it doesn't exist */
        var messageElement = document.getElementById(elementId + "-message");
        if (!messageElement) {
            messageElement = document.createElement("div");
            messageElement.id = elementId + "-message";
            document.body.appendChild(messageElement);
        }

        /* Display a message with a tick symbol indicating the code is copied */
        messageElement.innerHTML = "&#10004; Code Copied!";
        setTimeout(function () {
            messageElement.innerHTML = ""; // Clear the message after a brief timeout
        }, 2000); // Adjust the timeout duration as needed (e.g., 2000 milliseconds = 2 seconds)
    }

    return {
        copyCode: copyCode
    };
})();
