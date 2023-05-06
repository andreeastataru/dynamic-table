/*fetch("teams.json") //aduce date
  .then((r) => r.json()) //transforma
  .then((teams) => {
    //console.info("r1", teams);
    displayTeams(teams);
  });*/

import { sleep } from "./utils";

let allTeams = [];
let editId;

//aduc datele
fetch("http://localhost:3000/teams-json", {
  method: "GET", //cer datele
  headers: {
    "Content-type": "application/json" //precizam ca raspunsul serverului va fi in format json
  }
})
  .then(r => r.json())
  .then(teams => {
    //varibila teams de aici este locala deoarece o primesc raspuns de la request
    allTeams = teams; //salvam datele primite intr-o variabila globala declara mai sus ca sa le folosesc in functia de prepareEdit
    //puteam folosi window.teams = teams in loc de variabila declarata mai sus
    displayTeams(teams); //dupa ce functia se excuta variabila dispare
  });

function createTeamRequest(team) {
  return (
    fetch("http://localhost:3000/teams-json/create", {
      //se va efectua doar cand dau click pe submit
      method: "POST", //cum transmit date
      headers: {
        "Content-Type": "application/json" //in ce format transmit date
      },
      body: JSON.stringify(team)
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
    body: JSON.stringify({ id }) //stringify il transforma in string iar {} in obiect
  }).then(r => {
    return r.json();
  });
}

function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function getTeamsHtml(teams) {
  return teams
    .map(
      //primesc un json si il transform in string
      ({ promotion, members, name, url, id }) => ` 
              <tr>
                  <td>${promotion}</td>
                  <td>${members}</td>
                  <td>${name}</td>
                  <td>${url}</td>
                  <td>
                    <a data-id="${id}" class="remove-btn">✖</a>
                    <a data-id="${id}" class="edit-btn">&#9998;</a>
                  </td>
              </tr>`
    )
    .join("");
}

function displayTeams(teams) {
  document.querySelector("#teams tbody").innerHTML = getTeamsHtml(teams);
}

function readTeam() {
  return {
    //impachetez obiectul ca sa se creeze o echipa noua//ce pun in post//ii dau json
    promotion: document.getElementById("promotion").value, //ce imi da trebuie sa ii dau si eu inapoi citind din formular
    //trimit valoarea din elementul html
    members: document.getElementById("members").value,
    name: document.getElementById("name").value,
    url: document.getElementById("url").value
  };
}

function onSubmit(e) {
  // e este primul parametru din orice functie de tip onSubmit,onClick
  //console.warn("submit", e);
  e.preventDefault(); //nu face ceea ce ar face in mod normal (adica sa faca redirect)
  const team = readTeam(); //am rupt readTeam de celelalte doua functii
  if (editId) {
    //daca am in memorie id-ul pe care dau click
    team.id = editId; // am adaugat la ecipa si id-ul
    console.warn("update", team);
    updateTeamRequest(team).then(status => {
      //avem un team de la care lipseste id-ul care ne trebuie pentru a face updateul
      if (status.success) {
        window.location.reload();
      }
    });
  } else {
    createTeamRequest(team).then(status => {
      //console.warn("status", status);//primim un status si un id
      if (status.success) {
        //daca statusul este true
        window.location.reload(); //browserul va face refresh automat ca sa ne apara noile date
      }
    });
  }
}

function prepareEdit(id) {
  const teamForEdit = allTeams.find(team => team.id === id); //id-ul echipei e egal cu id-ul primit ca param
  console.warn("edit", id, typeof teamForEdit);
  editId = id; //salvez id-ul pe care fac click intr-o variabila globala declarata mai sus

  //acceaseaza inputurile de pe ultimul rand si transmite in ele valoarea pe care o dorim ( de dupa egal)
  document.getElementById("promotion").value = teamForEdit.promotion;
  document.getElementById("members").value = teamForEdit.members;
  document.getElementById("name").value = teamForEdit.name;
  document.getElementById("url").value = teamForEdit.url;
}

function initEvents() {
  const form = document.getElementById("editForm"); //vreau sa ascult formularul
  form.addEventListener("submit", onSubmit); //cand o functie este neapelata este de fapt referinta la acea functie ( asta e funxtie pe care ar trebui sa mi-o epeleze eventlistenerul)
  //nu pot da click direct pe x deoarece ei apar mai tarziu decat se executa initEvents()// deci vom asculta un click pe ceva ce exista inainte
  //sa se incarce adica tbody

  document.querySelector("#teams tbody").addEventListener("click", e => {
    //diferentiez tagurile de a prin clase
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id; // ia id-ul de pe elementul care s-a dat click// butonul primeste ca id, id-ul echipei
      deleteTeamRequest(id).then(status => {
        if (status.success) {
          window.location.reload();
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      prepareEdit(id);
    }
  });
}

initEvents();

sleep(2000).then(() => {
  console.info("done");
});
