//TODO breaks when delete all items from list - localstorage.items = undefined
//data-id


$(function(){
	getList();
	$(".submitbtn").click(submitInfo);
	$(".cleardone").click(clearDone);
});

var formLength = 0;
var doneText = "Done items:\n";
var items = [];


function submitInfo(){
	//identifys text in submit box and adds to local storage + regenerates list
	var formContents = document.getElementById("form1").value;
	//ajax post
	sendItem({"task":formContents});
	document.getElementById("form1").value="";
}

function addItem(items){
	var itemsJSON = JSON.parse(items);
	generateList(itemsJSON.task, itemsJSON.id);
}

function loadItems(itemList){
	$("#tasks").empty();
	var list = itemList;
	list.reverse();
	for (var i=0;i<list.length;i++){
		generateList(list[i].task,list[i].id);
	}
}
function generateList (divLabel,divID,divValue){
	var itemDiv = document.createElement('div');
	$(itemDiv).data("todoID", divID);
	//arrowdown
	var arrowD = document.createElement("img");
	arrowD.src = "images/down-arrow.png";
	arrowD.style.height = '8px';
    arrowD.style.width = '8px';
    arrowD.onclick = movedown;
	itemDiv.appendChild(arrowD);

	//arrow up
	var arrowU = document.createElement("img");
	arrowU.src = "images/up-arrow.png";
	arrowU.style.height = '8px';
	arrowU.style.width = '8px';
	arrowU.onclick = moveup;
	itemDiv.appendChild(arrowU);
	//tickbox
	var inputTick = document.createElement('input');
	inputTick.type = "checkbox";
	inputTick.className = "customCheckbox";
	//below needs work to define ID value
	inputTick.id = "tickbox" + divID;
	//below is no longer needed - strip out rest of checked=true code
	//inputTick.onclick = update;
	itemDiv.appendChild(inputTick);

	//create label div
	var divText = document.createElement('div');
	divText.innerText = divLabel;
	divText.className = "formatTextVisible"
	divText.onclick = edit;
	//$(divText).click(edit); <-- this is how to do the same as above but in jquery
	itemDiv.appendChild(divText);
	
	//input box shown when editing
	var editInput = document.createElement('input');
	editInput.className = 'editHide';
	itemDiv.appendChild(editInput);

	var taskDiv = document.getElementById("tasks");
	taskDiv.appendChild(itemDiv);

}

//combine below three into one function
/*var updateLocal = function(myArr){
	localStorage.items = JSON.stringify(myArr);
}*/

function clearDone(){
	var doneBox = document.getElementById("done");
	var nodes = document.getElementById("tasks").childNodes;


	$('input[type=checkbox]:checked').each(function () {
		var deleteItemID = $(this.parentNode).data().todoID;
        deleteItem(deleteItemID);
        var labelName = $(this).next()[0].innerHTML;
        doneText += labelName + "\n";
        this.parentNode.remove();
  	});

	doneBox.innerText = doneText;
}


function moveup(evt){
	console.log(evt.target);
	var thisItem = evt.target.parentElement;
	var index = $(thisItem).index();
	if(index !==0){
		var newPrior = index-1;
		var ID = $(thisItem).data().todoID;
		updatePrior(ID,newPrior);
		getList();
	}
}

function movedown(evt){
	console.log(evt.target);
	var thisItem = evt.target.parentElement;
	var index = $(thisItem).index();
	var totalItemNo = $(thisItem.parentElement).children().length;
	if(index !== totalItemNo-1){
		var newPrior = index+1;
		var ID = $(thisItem).data().todoID;
		updatePrior(ID,newPrior);
		getList();
	}
}
		
function edit(btn){

	var currDiv = this.parentNode;
	var text = this.innerHTML;
	var editHide = $($(this.parentNode).find(".editHide")[0]);
	var formatTextVisible = $($(this.parentNode).find(".formatTextVisible")[0]);
	editHide.val(text);
	editHide.show();
	formatTextVisible.hide();
	editHide.focus();

	editHide.focusout(function(){
		var inputText = this.value;
		var itemID = $(this.parentNode).data().todoID;
		formatTextVisible.text(inputText); 
		formatTextVisible.show();
		editHide.hide();
		updateItem = {
			id: itemID,
			task: inputText
		};
		update(updateItem);
	})

}

// ajax shizzle
function sendItem(todoItem){
	$.ajax({
	  type:"POST",
	  url: "http://localhost:3000/todo",
	  data: JSON.stringify(todoItem),
	  contentType:"application/json; charset=utf-8",
	  complete: function(result){
	  	addItem(result.responseText);
	  	},
	  		statusCode: {
    		401: function() {
      			document.location.href = '/login.html';
    		}
  		} 
	});
}

function update(todoItem){
	$.ajax({
	  type:"PUT",
	  url: "http://localhost:3000/todo/"+ todoItem.id,
	  data: JSON.stringify(todoItem),
	  contentType:"application/json; charset=utf-8",
	  		statusCode: {
    		401: function() {
      			document.location.href = '/login.html';
    		}
  		}
	});
}

function updatePrior(id, priority){
	$.ajax({
		type:"PUT",
		url: "http://localhost:3000/todos/priority?id=" + id + "&priority=" + priority,
				statusCode: {
    		401: function() {
      			document.location.href = '/login.html';
    		}
  		}
	})
}

function deleteItem(deleteItemID){
	$.ajax({
		type:"DELETE",
		//data:{id:169,task:'d'},
		url:"http://localhost:3000/todo/" + deleteItemID,
		//complete:function(result){
		//	clearDone(result.responseText);
		//},
		statusCode: {
    		401: function() {
      			document.location.href = '/login.html';
    		}
  		}
	})
}


function getList(){
	$.ajax({
		type:"GET",
		url: "http://localhost:3000/todos",
		contentType:"application/json; charset=utf-8",
		complete: function(result){
		loadItems(JSON.parse(result.responseText));
		},
		statusCode: {
    		401: function() {
      			document.location.href = '/login.html';
    		}
  		} 
		//cookie?
	});
}
