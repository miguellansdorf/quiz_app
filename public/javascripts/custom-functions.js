function prettyDate(dateString){
    if (!dateString)
        return null;
    else
        var date = new Date(dateString);
        var seconds = ((date.getSeconds()) < 10 ) ? ("0" + date.getSeconds()) : date.getSeconds();
        var minutes = (date.getMinutes() < 10 ) ? ("0" + date.getMinutes()) : date.getMinutes(); 
        var hours = (date.getHours() < 10 ) ? ("0" + date.getHours()) : date.getHours();
        var day = (date.getDate() < 10 ) ? ("0" + date.getDate()) : date.getDate();
        var month = ((date.getMonth() + 1) < 10 ) ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
        var year = date.getFullYear();
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

function toUpperCase(input){
    var output = input.toUpperCase();
    return output;
}

function firstToUpperCase(input){
    var output = input.charAt(0).toUpperCase() + input.substring(1);
    return output;
}