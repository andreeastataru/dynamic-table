/*fetch("teams.json") //aduce date
  .then((r) => r.json()) //transforma
  .then((teams) => {
    //console.info("r1", teams);
    displayTeams(teams);
  });*/

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
    allTeams = teams;
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
    body: JSON.stringify({ id }) //stringify il transforma in string iar {} in obiect
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
              <a data-id="${team.id}" class="remove-btn">✖</a>
              <a data-id="${team.id}" class="edit-btn">&#9998;</a>
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

  if (editId) {
    console.warn("edit");
  } else {
    createTeamRequest().then(status => {
      //console.warn("status", status);//primim un status si un id
      if (status.success) {
        //daca statusul este true
        window.location.reload(); //browserul va face refresh automat ca sa ne apara noile date
      }
    });
  }
}

function edit(id) {
  const team = allTeams.find(team => team.id === id); //id-ul echipei e egal cu id-ul primit ca param
  console.warn("edit", id, typeof team);
  editId = id;
  //acceaseaza inputurile de pe ultimul rand si transmite in ele valoarea pe care o dorim ( de dupa egal)
  document.getElementById("promotion").value = team.promotion;
  document.getElementById("members").value = team.members;
  document.getElementById("name").value = team.name;
  document.getElementById("url").value = team.url;
}

function initEvents() {
  const form = document.getElementById("editForm"); //vreau sa ascult formularul
  form.addEventListener("submit", onSubmit); //cand se face submit pe el
  //nu pot da click direct pe x deoarece ei apar mai tarziu decat se executa initEvents()// deci vom asculta un click pe ceva ce exista inainte
  //sa se incarce si asta este tbody
  document.querySelector("#teams tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id).then(status => {
        if (status.success) {
          window.location.reload();
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      edit(id);
    }
  });
}

initEvents();
