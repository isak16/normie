/**
 * Created by isak16 on 2017-03-02.
 */


function getMediaOnly(array, from, domain){
    var tempArr = [];
    for(var i = 0; i < array.length; i++){
         if(array[i].data.post_hint || checkUrlImage(array[i].data.url)){
             tempArr.push(returnVideoObject(array[i].data, from, domain));
         }
    }
    return tempArr;
}


function checkUrlImage(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

