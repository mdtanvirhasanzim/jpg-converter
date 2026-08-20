const fileInput = document.getElementById("fileInput");
const browseButton = document.getElementById("browseButton");
const dropZone = document.getElementById("dropZone");

const fileList = document.getElementById("fileList");

const settings = document.getElementById("settings");
const actions = document.getElementById("actions");

const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");

const clearButton = document.getElementById("clearButton");
const downloadAllButton =
    document.getElementById("downloadAllButton");

let files = [];


// ------------------------------
// OPEN FILE PICKER
// ------------------------------

browseButton.addEventListener("click", (event) => {

    event.stopPropagation();

    fileInput.click();

});


dropZone.addEventListener("click", () => {

    fileInput.click();

});


// ------------------------------
// FILE INPUT
// ------------------------------

fileInput.addEventListener("change", (event) => {

    addFiles(event.target.files);

    fileInput.value = "";

});


// ------------------------------
// DRAG & DROP
// ------------------------------

dropZone.addEventListener("dragover", (event) => {

    event.preventDefault();

    dropZone.classList.add("dragging");

});


dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragging");

});


dropZone.addEventListener("drop", (event) => {

    event.preventDefault();

    dropZone.classList.remove("dragging");

    addFiles(event.dataTransfer.files);

});


// ------------------------------
// ADD FILES
// ------------------------------

function addFiles(newFiles) {

    const imageFiles =
        Array.from(newFiles)
            .filter(file => file.type.startsWith("image/"));

    if (!imageFiles.length) {

        alert("Please select image files.");

        return;

    }

    imageFiles.forEach(file => {

        files.push({
            id: crypto.randomUUID(),
            file: file
        });

    });

    renderFiles();

}


// ------------------------------
// RENDER FILES
// ------------------------------

function renderFiles() {

    fileList.innerHTML = "";

    if (!files.length) {

        settings.hidden = true;

        actions.hidden = true;

        return;

    }

    settings.hidden = false;

    actions.hidden = false;


    files.forEach(item => {

        const file = item.file;

        const element =
            document.createElement("div");

        element.className = "file-item";

        const image =
            document.createElement("img");

        image.className = "file-preview";

        image.alt = "Image preview";

        const url =
            URL.createObjectURL(file);

        image.src = url;


        const info =
            document.createElement("div");

        info.className = "file-info";


        const name =
            document.createElement("div");

        name.className = "file-name";

        name.textContent = file.name;


        const size =
            document.createElement("div");

        size.className = "file-size";

        size.textContent =
            formatFileSize(file.size);


        const status =
            document.createElement("div");

        status.className = "file-status";

        status.textContent =
            "Ready to convert";


        info.appendChild(name);

        info.appendChild(size);

        info.appendChild(status);


        const remove =
            document.createElement("button");

        remove.className = "remove-button";

        remove.type = "button";

        remove.textContent = "×";

        remove.title = "Remove image";


        remove.addEventListener("click", () => {

            removeFile(item.id);

        });


        element.appendChild(image);

        element.appendChild(info);

        element.appendChild(remove);

        fileList.appendChild(element);

    });

}


// ------------------------------
// REMOVE FILE
// ------------------------------

function removeFile(id) {

    files =
        files.filter(item => item.id !== id);

    renderFiles();

}


// ------------------------------
// CLEAR ALL
// ------------------------------

clearButton.addEventListener("click", () => {

    files = [];

    renderFiles();

});


// ------------------------------
// QUALITY
// ------------------------------

quality.addEventListener("input", () => {

    qualityValue.textContent =
        `${quality.value}%`;

});


// ------------------------------
// CONVERT IMAGE
// ------------------------------

function convertToJPG(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();


        reader.onload = () => {

            const image =
                new Image();


            image.onload = () => {

                const canvas =
                    document.createElement("canvas");


                canvas.width =
                    image.naturalWidth;

                canvas.height =
                    image.naturalHeight;


                const context =
                    canvas.getContext("2d");


                // JPG doesn't support transparency.
                // Use white background.

                context.fillStyle = "#ffffff";

                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                context.drawImage(
                    image,
                    0,
                    0
                );


                canvas.toBlob(
                    (blob) => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "Conversion failed."
                                )
                            );

                            return;

                        }

                        resolve(blob);

                    },
                    "image/jpeg",
                    Number(quality.value) / 100
                );

            };


            image.onerror = () => {

                reject(
                    new Error(
                        "Could not read this image."
                    )
                );

            };


            image.src = reader.result;

        };


        reader.onerror = () => {

            reject(
                new Error(
                    "Could not read the file."
                )
            );

        };


        reader.readAsDataURL(file);

    });

}


// ------------------------------
// DOWNLOAD SINGLE FILE
// ------------------------------

function downloadBlob(blob, filename) {

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);

}


// ------------------------------
// DOWNLOAD ALL
// ------------------------------

downloadAllButton.addEventListener(
    "click",
    async () => {

        if (!files.length) {

            return;

        }


        downloadAllButton.disabled = true;

        downloadAllButton.textContent =
            "Converting...";


        try {

            for (const item of files) {

                const blob =
                    await convertToJPG(
                        item.file
                    );


                const originalName =
                    item.file.name
                        .replace(
                            /\.[^/.]+$/,
                            ""
                        );


                const filename =
                    `${originalName}.jpg`;


                downloadBlob(
                    blob,
                    filename
                );


                await delay(250);

            }

        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong while converting an image."
            );

        } finally {

            downloadAllButton.disabled = false;

            downloadAllButton.textContent =
                "Download All";

        }

    }
);


// ------------------------------
// HELPER FUNCTIONS
// ------------------------------

function delay(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


function formatFileSize(bytes) {

    if (bytes === 0) {

        return "0 Bytes";

    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(1024, index)
            ).toFixed(2)
        )
        + " "
        + units[index]
    );

}
