
const formvalue = document.getElementById("submit-form");
const phone = document.getElementById("txtPhone");



var flag = 0;


formvalue.addEventListener('submit', (e) => {
  e.preventDefault;
  nameValue = userName.value;
  emailValue = userEmail.value;
  subjectValue = userSubject.value;
  messageValue = userMessage.value;
  flag = 0;
  checkInput();
  if (flag == 0) {
    console.log("flag is 0");
 

    
    return false;
  } else {
    return false;
  }

})

function checkInput() {

  if (phone.value.trim().lenght<10||phone.value.trim().lenght<10 ) {
    document.getElementById("name-error").innerHTML = "Name cannot be empty";  
    document.getElementById("name-error").style.display("block")
    flag=1
  
  } else {
    document.getElementById("name-error").style.display("none")
    
  }
}