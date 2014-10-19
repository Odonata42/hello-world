//TODO breaks when delete all items from list - localstorage.items = undefined

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
	for (var i=0;i<list.length;i++){
		generateList(list[i].task,list[i].id);
	}
}
function generateList (divLabel,divID,divValue){
	this.divLabel = divLabel;
	this.divID = divID;
	//this.divValue = divValue;
	var itemDiv = document.createElement('div');
	itemDiv.id = "ItemID_" + divID;
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
		var deleteItemID = this.parentNode.id.match(/ItemID_([a-z0-9]+)/)[1];
        deleteItem(deleteItemID);
        var labelName = $(this).next()[0].innerHTML;
        doneText += labelName + "\n";
        this.parentNode.remove();
  	});

	doneBox.innerText = doneText;
}


function moveup(){
	//doesnt work
	var currDiv = this.parentNode;
	var items = getlocal();
	var currPrior = currDiv.id.match(/[0-9]+/)[0];

	items[currPrior].priority = currPrior - 1;
	items[currPrior-1].priority = parseInt(currPrior);
	items.sort(function(a,b){return a.priority- b.priority});
	updateLocal(items);
	loadItems();
	//need to update priority on reference div also
}

function movedown(){
	//doesnt work
	var currDiv = this.parentNode;
	var items = getlocal();
	var currPrior = parseInt(currDiv.id.match(/[0-9]+/)[0]);
	items[currPrior].priority = currPrior + 1;
	items[currPrior+1].priority = parseInt(currPrior);
	items.sort(function(a,b){return a.priority- b.priority});
	updateLocal(items);
	loadItems();

}
		
function edit(btn){
	//OK no refactoring needed
	//this.parent.id
	var currID=this.parentNode.id;
	var currDiv = this.parentNode;
	var text = $("#"+currID +">.formatTextVisible").text();
	$("#"+currID +">.editHide").val(text);
	$("#"+currID +">.editHide").show()
	$("#"+currID +">.formatTextVisible").hide()

	$("#"+currID +">.editHide").focus();
	$("#"+currID +">.editHide").focusout(function(){
	var inputText = this.value;
	$("#"+currID +">.formatTextVisible").text(inputText); 
	$("#"+currID +">.formatTextVisible").show();
	$("#"+currID +">.editHide").hide();

	})
	//need update request on server - ask Mark?

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
	});
}

function deleteItem(deleteItemID){
	$.ajax({
		type:"DELETE",
		//data:{id:169,task:'d'},
		url:"http://localhost:3000/todo/" + deleteItemID,
		//complete:function(result){
		//	clearDone(result.responseText);
		//},
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
	  //dataType: "string"
	});
}
