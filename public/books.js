$(document).ready(function() {
    $(".addBookToListButton").on("click", addBookToList)
    $(".removeBookFromListButton").on("click", removeBookFromList)
});

function removeBookFromList(e){
    let listId = $(e.target).data("list")
    let bookId = $(e.target).data("book")
    // console.log(listId)
    // console.log(bookId)
    
    $.ajax({
        url: `/lists/ajax/${listId}`,
        success: data => {
            let bookIndex = data.items.indexOf(bookId)
            if(bookIndex >= 0) {
                // console.log(data.items)
                data.items.splice(bookIndex, 1)
                // console.log(data.items)
                updateList(data) 
            }
        },
        error: data => {
            console.log(data)
        }
    })
};
  
function addBookToList(e){
    
    //console.log($(e.target).data("book"))
    let bookId = $(e.target).data("book")
    // e is the click event, the target is the clicked button
    // select shares parent with button
    // find :selected is jQuery the selected option
    // val is the value of the option (listid)
    //console.log($(e.target).siblings("select").find(":selected").val())
    let listId = $(e.target).siblings("select").find(":selected").val()
    console.log(bookId)
    console.log(listId)
    $.ajax({
        url: `/lists/ajax/${listId}`,
        success: data => {
            if(data.items.indexOf(bookId) === -1) {
                data.items.push(bookId)
                updateList(data) 
            }
        },
        error: data => {
            console.log(data)
        }
    })
};

function updateList(newList) {
    $.ajax({
        type: 'PUT',
        url: `/lists/ajax/${newList._id}`,
        data: newList,
        dataType: "json",
        success: data => {
            console.log('Successfully Updated List')
        } 
    })
}