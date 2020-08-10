if (typeof createImageBitmap === "undefined") {
    self.createImageBitmap = function (data) {
        return new Promise((resolve,reject) => {
            let dataURL;
            if (data instanceof Blob) {
                dataURL = URL.createObjectURL(data);
            } else if (data instanceof ImageData) {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = data.width;
                canvas.height = data.height;
                ctx.putImageData(data,0,0);
                dataURL = canvas.toDataURL();
            } else {
                throw new Error("createImageBitmap does not handle the provided image source type");
            }
            const img = document.createElement("img");
            img.addEventListener("load",function () {
                resolve(this);
            });
            img.src = dataURL;
        });
    };
}
var _imageBitmap;
const createImageBitmapExample = () => {
    self.createImageBitmap(blob_)
    .then( imageBitmap => {
        _imageBitmap = imageBitmap;
        // document.getElementById("message").innerHTML = imageBitmap;
    }).catch((e) => {
        console.log("decode error", e);
        document.getElementById("message").innerHTML = "decode error";
    });
    // var img = new Image();
    // console.log(blob_);
    // img.decode().then(() => {
    //     console.log("decoded");

    //   }).catch((e) => {
    //     console.log("decode error", e);
    // });
    // Load the sprite sheet from an image file
    // img.src = 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg';
};

const getRandomIntInclusive = (min, max)  => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
};

const getRandomIntArray = (size ,min, max)  => {
    var numArray = [];
    for (let i=0; i<size; i++) {
        let num = getRandomIntInclusive(min, max);
        numArray.push(num);
    }
    return numArray;
};

const resolution = [
    "",
    "720p.jpg",
    "1080p.jpg",
    "2k.jpg",
    "4k.jpg",
    "8k.jpg"
];

const getImage = () => {
    var imageType = imageOptions.options[imageOptions.selectedIndex].value,
        url = resolution[imageType];
        fetchImage(url);
};

const getImageBitMapfromDBWrapper = () => {
    var numOfImages = document.querySelector("#numOfImages").value || 1,
        imageOptions = document.querySelector("#imageOptions"),
        dbSize = document.querySelector("#dbSize").value || 50;

    var queryArray = getRandomIntArray(numOfImages, 1, dbSize);
    timeGetImageBitMapfromDB = performance.now();
    getImageBitMapfromDB(numOfImages, queryArray);
};

var timeGetImageBitMapfromDB = 0;
const getImageBitMapfromDB = (numOfImages, queryArray) => {  
    var transaction = db.transaction("ImageStore");
    transaction.oncomplete = function (event) {
        // console.log("read transaction successful");
    };
    var objectStore = transaction.objectStore("ImageStore");
    getValue(numOfImages, queryArray, objectStore);
};

const getValue = (times, queryArray, objectStore) => {
    times = parseInt(times);
    if (times === 0) {
        var t2 = performance.now();
        console.log("time taken :", t2 - timeGetImageBitMapfromDB);
        return;
    }
    var req = objectStore.get(queryArray[times-1]);
    req.onsuccess = function (event) {
        getValue(parseInt(parseInt(times) - 1), queryArray, objectStore);
    };
    req.onerror = function (event) {
        console.log("read failed");
    };
};

const createImageBitmapInMemoryWrapper = () => {
    var numOfImages = document.querySelector("#numOfImages").value || 1,
        imageOptions = document.querySelector("#imageOptions");
    
    timeCreateImageBitmapInMemory = performance.now();
    createImageBitmapInMemory(numOfImages);
};

var timeCreateImageBitmapInMemory = 0;
const createImageBitmapInMemory = (numOfImages) => {
    numOfImages = parseInt(numOfImages);
    if (numOfImages === 0) {
        var t2 = performance.now();
        console.log("time taken :", t2 - timeCreateImageBitmapInMemory);
        return;
    }
    self.createImageBitmap(blob_)
    .then( imageBitmap => {
        createImageBitmapInMemory(parseInt(parseInt(numOfImages) - 1));
    });
};

const storeImageWrapper = () => {
    var dbSize = document.querySelector("#dbSize").value || 50;
    storeImages(_imageBitmap, dbSize);
};

const storeImages = (imageData, numberOfRecords) => {
    if (numberOfRecords === 0) return; 
    numberOfRecords = parseInt(numberOfRecords);
    var transaction = db.transaction(["ImageStore"], "readwrite");
    transaction.oncomplete = function (event) {
        storeImages(imageData, parseInt(parseInt(numberOfRecords) - 1));
    };

    transaction.onerror = function (event) {
        console.log("transaction failed", event.target.error);
    };

    console.log("numOfRecords:", numberOfRecords);
    var objectStore = transaction.objectStore("ImageStore");
    var request = objectStore.add(imageData, numberOfRecords);
    // console.log('%c js: add request for ', 'background: green; color: #bada55', start);
    request.onerror = function (event) {
        console.error("js", event.result, ": entry couldn't be added " + event.target.error);
    };
    request.onsuccess = function (event) {
        console.log('%c js: entry added successfully! ', 'background: #222; color: #bada55');
    };
};

var db;
var limit = 0;

var blob_,
    arrayBuffer_,
    text_,
    sizeMB_ = 0,
    textSize_ = 2.4,
    totalMB_ = 0;

const deleteDB = () => {
    var DBDeleteRequest = indexedDB.deleteDatabase("db1");

    DBDeleteRequest.onerror = function (event) {
        console.log("Error deleting database.");
    };

    DBDeleteRequest.onsuccess = function (event) {
        console.log("Database deleted successfully");

        console.log(event.result); // should be undefined
    };
}

const fetchImage = (url) => {
    url = url || 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg';
    fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
            blob_ = blob;
            createImageBitmapExample();
            var fileReader = new FileReader();
            fileReader.onload = function(event) {
                arrayBuffer_ = event.target.result || event.result;
            };
            fileReader.readAsArrayBuffer(blob);

            var fileReaderText = new FileReader();
            fileReaderText.onload = function(event) {
                text_ = event.target.result;
            };
            fileReaderText.readAsText(blob);
        });
};
// fetchImage('./2.jpg');
// fetchImage();
// fetchImage('https://images.pexels.com/photos/347139/pexels-photo-347139.jpeg');
// fetchImage('https://www.hdwallpapers.in/download/skull_10_4k_8k_hd_creative-7680x4320.jpg');
var st = 1;
var t = document.getElementById('totalSize');
var num = document.getElementById('number');
var str = document.getElementById('string');
var arrbuf = document.getElementById('arrayBuffer');
var msg, type;

const storeData = () => {
    let numOfRecords = document.getElementById('storeDataInput').value;
    jsStoreData(numOfRecords || 100);
};

const storeBlob = () => {
    type = "blob";
    let numOfRecords = document.getElementById('storeDataInput').value;
    jsStoreData(numOfRecords);
};

const storeString = (numOfRecords) => {
    type = "string";
    jsStoreData(numOfRecords);
};

const storeNumber = (numOfRecords) => {
    type = "number";
    jsStoreData(numOfRecords);
};

const storeArrayBuffer = (numOfRecords) => {
    type = "arrayBuffer";
    jsStoreData(numOfRecords);
};

const jsStoreData = (numOfRecords) => {
    if (numOfRecords === 0) return;
    // var record = text_;
    var record = _imageBitmap;
    var msg = document.getElementById('number');
    msg.innerHTML = "";
    msg = num;
    if (type === 'number') {
        record = 11111;
        msg = num;
    } else if (type === 'string') {
        record = "dadadadadada";
        msg = str;
    } else if (type === 'arrayBuffer') {
        record = arrayBuffer_;
        msg = arrbuf;
    } else if (type === 'blob') {
        record = blob_;
    }
    
    // for (let i = 1; i <= numOfRecords; i++) {

        var transaction = db.transaction(["ImageStore"], "readwrite");
        transaction.oncomplete = function (event) {
            // console.log("transaction successful");
            totalMB_ += parseFloat(textSize_);
            var tmp = parseFloat(totalMB_).toFixed(2);
            console.log("total size: ", tmp, " MB");
            var t = document.getElementById('totalSize');
            t.innerHTML = "current size = " + tmp + " MB";
            var msg = document.getElementById('number');
            msg.innerHTML = "added to indexedDB";
            console.log("numOfRecords : ", numOfRecords);
            jsStoreData(parseInt(parseInt(numOfRecords) - 1));
        };

        transaction.onerror = function (event) {
            console.log("transaction failed", event.target.error);
        };

        var objectStore = transaction.objectStore("ImageStore");
        var key = "js" + st;
        var request = objectStore.add(record, key);
        // console.log('%c js: add request for ', 'background: green; color: #bada55', start);
        request.onerror = function (event) {
            console.error("js", event.result, ": entry couldn't be added " + event.target.error);
        };
        request.onsuccess = function (event) {
            console.log('%c js: entry added successfully! ', 'background: #222; color: #bada55');

        };

        st++;
    // }
};

const clearDB = () => {
    var transaction = db.transaction("ImageStore", "readwrite");
    transaction.oncomplete = function (event) {
        console.log("delete transaction successful");
    };
    var objectStore = transaction.objectStore("ImageStore");
    var req = objectStore.clear();
    req.onsuccess = function (event) {
        console.log("all entries deleted");
    };
};

const search = () => {
    var key = document.getElementById('readDataInput').value;
    if (!key) return;
    var t0 = performance.now();
    var transaction = db.transaction("ImageStore");
    transaction.oncomplete = function (event) {
        console.log("read transaction successful");
    };
    var objectStore = transaction.objectStore("ImageStore");
    var req = objectStore.get(key);
    req.onsuccess = function (event) {
        console.log(event);
        if (req.result) {
            var t1 = performance.now();
            console.log(t1-t0);
            console.log("read successful : ", req.result);
            // document.getElementById('readDataOutput')
            // .innerHTML = req.result;
            document.getElementById('readDataOutput')
            .innerHTML = t1-t0;
            
        }
    };
    req.onerror = function (event) {
        console.log("read failed");
    };
};

onDBError = event => {
    console.error("Database error: " + event.target.errorCode);
};

var currentVersion = 1;
// In other tab where you want observation of changes
// const channel = new BroadcastChannel('myChannel');
// channel.onmessage = function(event) {
//   const message = event.data;
//   console.log('A message occurred', message);
//   currentVersion = message.dbversion;
// };

const createDB = () => {
    console.log("createDB1");
    var request = window.indexedDB.open("db1", currentVersion);
    console.log(request);
    request.onerror = function (event) {
        console.log("createDb: DB open failed:", event.target.error);
    };
    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("createDb: DB open successful with version:", currentVersion);
        // fetchImage();
        db.onversionchange = function (event) {
            console.log('a database change has occurred');
            document.getElementById('upgradeMsg').innerHTML='a database change has occurred';
        };
    };
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        db.onerror = onDBError;
        console.log("old version =", event.oldVersion, ", new version = ", event.newVersion);
        // if (event.newVersion == 0)
        db.createObjectStore("ImageStore");

    };
};


openDBWithHigherVersion = () => {
    var newVersion = currentVersion + 1;
    console.log("openDB With HigherVersion =", newVersion);

    var request = indexedDB.open("db1", newVersion);
    console.log("request =", request);
    request.onerror = function (event) {
        console.log("openDBWithHigherVersion: DB open failed:", event.target.error);
    };
    request.onsuccess = function (event) {
        // db = event.target.result;
        console.log("openDBWithHigherVersion: DB open successful");
        var obj = {
            "message": "db upgraded",
            "dbversion": newVersion
        };
        // channel.postMessage("obj");
        // jsStoreData(start);
    };

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        db.onerror = onDBError;
        console.log("openDBWithHigherVersion: old version =", event.oldVersion, ", new version = ", event.newVersion);
    };


};

const closeDB = () => {
    console.log("close DB");
    db.close();
}
