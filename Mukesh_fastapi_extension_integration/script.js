

async function fetchData() {
    const res = await fetch("https://api.coronavirus.data.gov.uk/v1/data");
    const record = await res.json();
    document.getElementById("date").innerHTML = record.data[0].date;
    document.getElementById("areaName").innerHTML = record.data[0].areaName;
    document.getElementById("latestBy").innerHTML = record.data[0].latestBy;
    document.getElementById("deathNew").innerHTML = record.data[0].deathNew;
}
fetchData();

async function getText() {
    var fulldata = document.getElementsByTagName('html')[0].innerHTML
    console.log("http://127.0.0.1:8000/items/"+fulldata.replace(/[^a-z0-9]/gi, ''))
    const res = await fetch("http://127.0.0.1:8000/items/"+fulldata);
    const record = await res.json();
    alert(record.data)

}

getText();

(() => {
    let httpRequest;
    document
      .getElementById("ajaxButton")
      .addEventListener("click", makeRequest);

    function makeRequest() {
      httpRequest = new XMLHttpRequest();

      if (!httpRequest) {
        alert("Giving up :( Cannot create an XMLHTTP instance");
        return false;
      }
      httpRequest.onreadystatechange = alertContents;
      httpRequest.open("GET", "http://127.0.0.1:8000/items/hello");
      httpRequest.send();
    }

    function alertContents() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          alert(httpRequest.responseText);
          console.log("Sucess!!")
        } else {
          alert("There was a problem with the request.");
        }
      }
    }
  })();

