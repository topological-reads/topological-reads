$(document).ready(function() {
    $(".addBookToListButton").on("click", addBookToList)
    
});
  
function addBookToList(e){
    //console.log($(e.target).data("book"))
    let bookId = $(e.target).data("book")
    // e is the click event, the target is the clicked button
    // select shares parent with button
    // find :selected is jQuery the selected option
    // val is the value of the option (listid)
    console.log($(e.target).siblings("select").find(":selected").val())
    let listId = $(e.target).siblings("select").find(":selected").val()

    $.ajax({
        url: `/lists/${listId}`,
        success: data => {
            data.items.push(bookId)
            updateList(data)
        } 
    })
};

function updateList(newList) {
    $.ajax({
        type: 'PUT',
        url: `/lists/${newList._id}`,
        data: newList,
        dataType: "json",
        success: data => {
            console.log('Successfully Updated List')
        } 
    })
}