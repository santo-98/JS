import { exec } from 'child_process';

function test(exec){
  console.log(exec)
  document.getElementById("test").innerHTML = "Worked"
}

test(exec)