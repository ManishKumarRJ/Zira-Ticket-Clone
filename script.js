let addbtn = document.querySelector('.add-btn');
let modalCont = document.querySelector('.modal-cont');
let addFlag=false;
let mainCont = document.querySelector('.main-cont');
let textareacont = document.querySelector('.textarea-cont')
let removebtn = document.querySelector('.remove-btn');
let lockElem = document.querySelector('.ticket-lock')

let allpriorityColors = document.querySelectorAll('.priority-color');
let colors = ['lightpink','lightblue','lightgreen', 'black'];
let defaultPriorityColor = colors[colors.length-1];

let toolboxcolore = document.querySelectorAll('.color');


let removeflag = false;

let lockClass = "fa-lock";;
let unlockClass = "fa-lock-open";

let ticketArr = [];

if(localStorage.getItem("jira_tickets")){
    ticketArr = JSON.parse(localStorage.getItem("jira_tickets"))
    ticketArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
    })
}
for(let i = 0; i<toolboxcolore.length; i++){
    toolboxcolore[i].addEventListener('click', (e)=>{
        let currtoolboxcolor = toolboxcolore[i].classList[1];
        let filteredTickets = ticketArr.filter((ticketObj)=>{
            return currtoolboxcolor===ticketObj.ticketColor;
        })
       
        console.log(ticketArr);
        // removee previous ticket 

        let allTicketcont = document.querySelectorAll('.ticket-cont');
        allTicketcont.forEach((ticket)=>{
            ticket.remove();
        })
        console.log('b');
        // display new filtered tickets
        filteredTickets.forEach((ticketObj)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
        })
        console.log(filteredTickets);
    })
    // double click on priority colors
    toolboxcolore[i].addEventListener('dblclick', (e)=>{
        // removee previous ticket 
        let allTicketcont = document.querySelectorAll('.ticket-cont');
        allTicketcont.forEach((ticket)=>{
            ticket.remove();
        })

        ticketArr.forEach((ticketObj)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })
}

// listen for modal priority coloring

allpriorityColors.forEach((colorElem,idx)=>{
    colorElem.addEventListener('click',(e)=>{
        allpriorityColors.forEach((colore,idx)=>{
            colore.classList.remove('border');
        })
        colorElem.classList.add('border');

        defaultPriorityColor = colorElem.classList[0];
    })

})

addbtn.addEventListener('click',(e)=>{
    // display modal
    // generate ticket

    // addflag, true = modal display
    // false -> none
    addFlag= !addFlag;
    if(addFlag){ modalCont.style.display = 'flex';}
    else{
        modalCont.style.display = 'none';
    }
})

// on pressing shift generates ticket
modalCont.addEventListener('keydown',(e)=>{
    let key = e.key;
    if(key==='Shift'){

        addFlag = false;
        createTicket(defaultPriorityColor,textareacont.value);
        setModaltoDefault();
    }
})

// remove btn listener
removebtn.addEventListener('click',(e)=>{
    removeflag = !removeflag;
})

function createTicket(ticketColor, ticketTask, ticketId){
    
    let id = ticketId || shortid();
    
    let ticketCont = document.createElement('div') ;
    ticketCont.setAttribute('class','ticket-cont');
    // console.log('aman');
    ticketCont.innerHTML=`
            <div class="ticket-color ${ticketColor}"></div>
            <div class="ticket-id">#${id}</div>
            <div class="task-area" spellcheck="false">${ticketTask}</div>
            <div class="ticket-lock">
                <i class="fa-solid fa-lock"></i>
            </div>
    `;
    // create obj and push it in ticket arr
    if(!ticketId) {
        ticketArr.push({ticketColor, ticketTask, ticketId:id});
        localStorage.setItem("jira_tickets",JSON.stringify(ticketArr));
    }
        mainCont.appendChild(ticketCont);
    handleLock(ticketCont, id);
    handleRemoval(ticketCont, id);
    handleTicketColor(ticketCont, id);

}
function handleRemoval(ticket, id){
    // remove flag true remove
    ticket.addEventListener('click',(e)=>{
        if(!removeflag) return;
        let idx = getTicketIdx(id);
        // db removal
        ticketArr.splice(idx,1);
        let strTicketsArr = JSON.stringify(ticketArr);
        localStorage.setItem("jira_tickets",strTicketsArr);
        // ui removal
        ticket.remove();
    })
}

function handleLock(ticket, id){
    let ticketLockElem = ticket.querySelector('.ticket-lock');
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector('.task-area');
    ticketLock.addEventListener('click',(e)=>{
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute('contenteditable','true')
            
        }else{
            ticketLock.classList.add(lockClass);
            ticketLock.classList.remove(unlockClass);
            ticketTaskArea.setAttribute('contenteditable','false')
        }
        // modify data in localstorage (priority color change)
        let ticketIdx = getTicketIdx(id);
        ticketArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
      
    })
}

// change ticket color
function handleTicketColor(ticketCont, id){
    let ticketcolorElem = ticketCont.querySelector('.ticket-color');
    ticketcolorElem.addEventListener('click',(e)=>{
        let currcolor = ticketcolorElem.classList[1];
        let currcolorIndex = colors.findIndex((color)=>{
            return color===currcolor;
        })
        currcolorIndex++;
        let newcolorIndex = currcolorIndex%colors.length;
        let newcolor = colors[newcolorIndex];
        ticketcolorElem.classList.remove(currcolor);
        ticketcolorElem.classList.add(newcolor);

        // modify data in localstorage (priority color change)
        let ticketIdx = getTicketIdx(id);
        ticketArr[ticketIdx].ticketColor = newcolor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })
}

function setModaltoDefault(){
    textareacont.value = "";
    modalCont.style.display = 'none';
    allpriorityColors.forEach((colore,idx)=>{
        colore.classList.remove('border');
    })
    allpriorityColors[allpriorityColors.length-1].classList.add('border');

    defaultPriorityColor = colors[colors.length-1];

}

function getTicketIdx(id){
    let ticketIdx = ticketArr.findIndex((ticketObj)=>{
        return ticketObj.ticketId === id;
    })
    return ticketIdx;
}