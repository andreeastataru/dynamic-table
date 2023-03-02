/*fetch("teams.json") //aduce date
  .then((r) => r.json()) //transforma
  .then((teams) => {
    //console.info("r1", teams);
    displayTeams(teams);
  });*/

//aduc datele
fetch("http://localhost:3000/teams-json", {
  method: "GET", //cer datele
  headers: {
    "Content-type": "application/json" //precizam ca raspunsul serverului va fi in format json
  }
})
  .then(r => r.json())
  .then(teams => {
    displayTeams(teams);
  });

function createTeamRequest() {
  return (
    fetch("http://localhost:3000/teams-json/create", {
      //se va efectua doar cand dau click pe submit
      method: "POST", //cum transmit date
      headers: {
        "Content-Type": "application/json" //in ce format transmit date
      },
      body: JSON.stringify({
        //impachetez obiectul ca sa se creeze o echipa noua//ce pun in post//ii dau json
        promotion: document.getElementById("promotion").value, //ce imi da trebuie sa ii dau si eu inapoi citind din formular
        //trimit valoarea din elementul html
        members: document.getElementById("members").value,
        name: document.getElementById("name").value,
        url: document.getElementById("url").value
      })
    })
      //1. Facem requestul => 2. Convertim la json => 3. Asteptam raspunsul care este un status
      .then(r => r.json())
  );
}

function deleteTeamRequest(id) {
  // DELETE teams-json/delete
  return fetch("http://localhost:3000/teams-json/delete", {
    //punem return ca sa ne dea raspunsul de la server, nu doar sa faca fetch-ul
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  }).then(r => {
    return r.json();
  });
}

function displayTeams(teams) {
  //console.info("r1", teams);
  const teamsHTML = teams.map(
    //primesc un json si il transform in string
    team => ` 
        <tr>
            <td>${team.promotion}</td>
            <td>${team.members}</td>
            <td>${team.name}</td>
            <td>${team.url}</td>
            <td>
              <a data-id="${team.id}">✖</a>
            </td>
        </tr>`
  );
  //console.info("teamsHTML", teamsHTML);

  document.querySelector("#teams tbody").innerHTML = teamsHTML.join("");
}

function onSubmit(e) {
  // e este primul parametru din orice functie de tip onSubmit,onClick
  //console.warn("submit", e);
  e.preventDefault(); //nu face ceea ce ar face in mod normal (adica sa faca redirect)

  createTeamRequest().then(status => {
    //console.warn("status", status);//primim un status si un id
    if (status.success) {
      //daca statusul este true
      window.location.reload(); //browserul va face refresh automat ca sa ne apara noile date
    }
  });
}

function initEvents() {
  const form = document.getElementById("editForm"); //vreau sa ascult formularul
  form.addEventListener("submit", onSubmit); //cand se face submit pe el

  document.querySelector("#teams tbody").addEventListener("click", e => {
    if (e.target.matches("a")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id).then(s => {
        if (s.success) {
          window.location.reload();
        }
      });
    }
  });
}

initEvents();
