

// ======================================================
// ELEMENTS
// ======================================================

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


// ======================================================
// FILE STORAGE
// ======================================================

let files = [];


// ======================================================
// SUPPORTED EXTENSIONS
// ======================================================

const supportedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "heic",
    "heif"
];


// ======================================================
// GET FILE EXTENSION
// ======================================================

function getExtension(file) {

    return file.name
        .split(".")
        .pop()
        .toLowerCase();

}


// ======================================================
// CHECK SUPPORTED FILE
// ======================================================

function isSupportedFile(file) {

    const extension = getExtension(file);

    return supportedExtensions.includes(extension);

}


// ======================================================
// BROWSE BUTTON
// ======================================================

browseButton.addEventListener("click", (event) => {

    event.preventDefault();
    event.stopPropagation();

    fileInput.click();

});


// ======================================================
// DROP ZONE CLICK
// ======================================================

dropZone.addEventListener("click", (event) => {

    if (event.target === browseButton) {
        return;
    }

    fileInput.click();

});


// ======================================================
// FILE INPUT
// ======================================================

fileInput.addEventListener("change", (event) => {

    addFiles(event.target.files);

    // Allows selecting the same file again.
    fileInput.value = "";

});


// ======================================================
// DRAG OVER
// ======================================================

dropZone.addEventListener("dragover", (event) => {

    event.preventDefault();

    event.stopPropagation();

    dropZone.classList.add("dragging");

});


// ======================================================
// DRAG LEAVE
// ======================================================

dropZone.addEventListener("dragleave", (event) => {

    event.preventDefault();

    dropZone.classList.remove("dragging");

});


// ======================================================
// DROP
// ======================================================

dropZone.addEventListener("drop", (event) => {

    event.preventDefault();

    event.stopPropagation();

    dropZone.classList.remove("dragging");

    addFiles(event.dataTransfer.files);

});


// ======================================================
// ADD FILES
// ======================================================

function addFiles(fileCollection) {

    const selectedFiles =
        Array.from(fileCollection)
            .filter(isSupportedFile);


    if (selectedFiles.length === 0) {

        alert(
            "Please select JPG, JPEG, PNG, WebP, HEIC or HEIF files."
        );

        return;

    }


    selectedFiles.forEach((file) => {

        files.push({
            id: crypto.randomUUID(),
            file: file
        });

    });


    renderFiles();

}


// ======================================================
// RENDER FILES
// ======================================================

function renderFiles() {

    fileList.innerHTML = "";


    if (files.length === 0) {

        settings.hidden = true;
        actions.hidden = true;

        return;

    }


    settings.hidden = false;
    actions.hidden = false;


    files.forEach((item) => {

        const file = item.file;

        const extension = getExtension(file);


        // ----------------------------------------------
        // FILE ITEM
        // ----------------------------------------------

        const element =
            document.createElement("div");

        element.className = "file-item";


        // ----------------------------------------------
        // PREVIEW
        // ----------------------------------------------

        const preview =
            document.createElement("div");

        preview.className = "preview-container";


        if (
            extension === "heic" ||
            extension === "heif"
        ) {

            preview.className =
                "preview-container special-preview";

            preview.textContent =
                extension.toUpperCase();

        } else {

            const image =
                document.createElement("img");

            image.className = "file-preview";

            image.alt = file.name;

            const url =
                URL.createObjectURL(file);

            image.src = url;

            image.onload = () => {
                URL.revokeObjectURL(url);
            };

            preview.appendChild(image);

        }


        // ----------------------------------------------
        // FILE INFORMATION
        // ----------------------------------------------

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


        // ----------------------------------------------
        // REMOVE
        // ----------------------------------------------

        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.className =
            "remove-button";

        removeButton.textContent = "×";

        removeButton.title =
            "Remove file";


        removeButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                removeFile(item.id);

            }
        );


        // ----------------------------------------------
        // APPEND
        // ----------------------------------------------

        element.appendChild(preview);
        element.appendChild(info);
        element.appendChild(removeButton);

        fileList.appendChild(element);

    });

}


// ======================================================
// REMOVE FILE
// ======================================================

function removeFile(id) {

    files =
        files.filter(
            (item) => item.id !== id
        );

    renderFiles();

}


// ======================================================
// CLEAR ALL
// ======================================================

clearButton.addEventListener("click", () => {

    files = [];

    renderFiles();

});


// ======================================================
// QUALITY SLIDER
// ======================================================

quality.addEventListener("input", () => {

    qualityValue.textContent =
        `${quality.value}%`;

});


// ======================================================
// CONVERT HEIC / HEIF
// ======================================================

async function convertHEIC(file) {

    const result =
        await heic2any({

            blob: file,

            toType: "image/jpeg",

            quality:
                Number(quality.value) / 100

        });


    if (Array.isArray(result)) {

        return result[0];

    }


    return result;

}


// ======================================================
// LOAD IMAGE
// ======================================================

function loadImage(blob) {

    return new Promise((resolve, reject) => {

        const url =
            URL.createObjectURL(blob);

        const image =
            new Image();


        image.onload = () => {

            URL.revokeObjectURL(url);

            resolve(image);

        };


        image.onerror = () => {

            URL.revokeObjectURL(url);

            reject(
                new Error(
                    "Browser could not read this image."
                )
            );

        };


        image.src = url;

    });

}


// ======================================================
// CONVERT ANY IMAGE TO JPG
// ======================================================

async function convertToJPG(file) {

    let sourceFile = file;

    const extension =
        getExtension(file);


    // --------------------------------------------------
    // HEIC / HEIF
    // --------------------------------------------------

    if (
        extension === "heic" ||
        extension === "heif"
    ) {

        try {

            sourceFile =
                await convertHEIC(file);

        } catch (error) {

            console.error(
                "HEIC conversion error:",
                error
            );

            throw new Error(
                "This HEIC/HEIF file could not be converted."
            );

        }

    }


    // --------------------------------------------------
    // LOAD IMAGE
    // --------------------------------------------------

    const image =
        await loadImage(sourceFile);


    // --------------------------------------------------
    // CANVAS
    // --------------------------------------------------

    const canvas =
        document.createElement("canvas");


    canvas.width =
        image.naturalWidth;

    canvas.height =
        image.naturalHeight;


    const context =
        canvas.getContext("2d");


    if (!context) {

        throw new Error(
            "Could not create image canvas."
        );

    }


    // --------------------------------------------------
    // WHITE BACKGROUND
    // --------------------------------------------------

    context.fillStyle =
        "#ffffff";

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------
    // DRAW IMAGE
    // --------------------------------------------------

    context.drawImage(
        image,
        0,
        0
    );


    // --------------------------------------------------
    // CREATE JPG
    // --------------------------------------------------

    const blob =
        await new Promise((resolve) => {

            canvas.toBlob(
                resolve,
                "image/jpeg",
                Number(quality.value) / 100
            );

        });


    if (!blob) {

        throw new Error(
            "JPG conversion failed."
        );

    }


    return blob;

}


// ======================================================
// DOWNLOAD BLOB
// ======================================================

function downloadBlob(blob, filename) {

    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;

    link.style.display = "none";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);

}


// ======================================================
// GET FILE STATUS
// ======================================================

function getStatusElement(index) {

    const items =
        fileList.querySelectorAll(
            ".file-item"
        );


    if (!items[index]) {
        return null;
    }


    return items[index].querySelector(
        ".file-status"
    );

}


// ======================================================
// DOWNLOAD ALL
// ======================================================

downloadAllButton.addEventListener(
    "click",
    async () => {

        if (files.length === 0) {

            return;

        }


        downloadAllButton.disabled = true;
        clearButton.disabled = true;


        try {

            for (
                let i = 0;
                i < files.length;
                i++
            ) {

                const item = files[i];

                const status =
                    getStatusElement(i);


                if (status) {

                    status.textContent =
                        `Converting ${i + 1} of ${files.length}...`;

                }


                const blob =
                    await convertToJPG(
                        item.file
                    );


                const originalName =
                    item.file.name.replace(
                        /\.[^/.]+$/,
                        ""
                    );


                const filename =
                    `${originalName}.jpg`;


                downloadBlob(
                    blob,
                    filename
                );


                if (status) {

                    status.textContent =
                        "✓ Converted successfully";

                }


                await delay(300);

            }

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Something went wrong while converting the image."
            );

        } finally {

            downloadAllButton.disabled = false;
            clearButton.disabled = false;

        }

    }
);


// ======================================================
// DELAY
// ======================================================

function delay(milliseconds) {

    return new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


// ======================================================
// FORMAT FILE SIZE
// ======================================================

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
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        )
        +
        " " +
        units[index]
    );

}