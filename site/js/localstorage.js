/**
 * Created by isak16 on 2017-02-27.
 */
function saveLocalStorage(name, obj){
    // Put the object into storage
    localStorage.setItem(name, JSON.stringify(obj));
}

function getLocalStorage(name){
    var retrievedObject = localStorage.getItem(name);
    return JSON.parse(retrievedObject);
}


function saveSessionLocalStorage(name, obj){
    // Put the object into storage
    sessionStorage.setItem(name, JSON.stringify(obj));
}

function getSessionLocalStorage(name){
    var retrievedObject = sessionStorage.getItem(name);
    return JSON.parse(retrievedObject);
}

function clearReddits() {
    var retrievedObject = JSON.parse(localStorage.getItem("reddits"));
    angular.forEach(retrievedObject, function (item) {
        localStorage.removeItem(item);
    });
}