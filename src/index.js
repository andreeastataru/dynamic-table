import { loadTeamsRequest, createTeamRequest, deleteTeamRequest, updateTeamRequest } from "./requests";
import { $, sleep } from "./utils";
//const utils = require("./utils");

/*fetch("teams.json") //aduce date
  .then((r) => r.json()) //transforma
  .then((teams) => {
    //console.info("r1", teams);
    displayTeams(teams);
  });*/

let allTeams = [];
let editId;

function getTeamsHtml(teams) {
  return teams
    .map(
      //primesc un json si il transform in string
      ({ promotion, members, name, url, id }) => ` 
            <tr>
                <td>${promotion}</td>
                <td>${members}</td>
                <td>${name}</td>
                <td><a href="${url}" target="_blank">${url.replace("https://github.com/", "")}</a></td>
                <td>
                  <a data-id="${id}" class="remove-btn">✖</a>
                  <a data-id="${id}" class="edit-btn">&#9998;</a>
                </td>
            </tr>`
    )
    .join("");
}

let oldDisplayTeams;

function displayTeams(teams) {
  if (oldDisplayTeams === teams) {
    console.warn("same teams to display");
    return;
  } //pentru push nu merge deoarece in arryul vechi am fortat adaugarea unui nou element, deci considera si arrayul nou si cel vechi acelasi si considera ca nu trebuie sa intre in if
  //cand vrem sa adaugam un element nou cel mai bine e sa nu il modificam pe cel vechi ci sa creem unul nou
  console.info(oldDisplayTeams, teams);
  oldDisplayTeams = teams; //crrez o variabila cu ce am afisat ultima data
  document.querySelector("#teams tbody").innerHTML = getTeamsHtml(teams);
}

function loadTeams() {
  loadTeamsRequest().then(teams => {
    //varibila teams de aici este locala deoarece o primesc raspuns de la request
    allTeams = teams; //salvam datele primite intr-o variabila globala declara mai sus ca sa le folosesc in functia de prepareEdit
    //puteam folosi window.teams = teams in loc de variabila declarata mai sus
    displayTeams(teams); //dupa ce functia se excuta variabila dispare
  });
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

async function onSubmit(e) {
  // e este primul parametru din orice functie de tip onSubmit,onClick
  //console.warn("submit", e);
  e.preventDefault(); //nu face ceea ce ar face in mod normal (adica sa faca redirect)
  const team = readTeam(); //am rupt readTeam de celelalte doua functii
  let status = { success: false }; //simulam ca e fals
  if (editId) {
    //daca am in memorie id-ul pe care dau click
    team.id = editId; // am adaugat la ecipa si id-ul
    console.warn("update", team);
    status = await updateTeamRequest(team);
    //avem un team de la care lipseste id-ul care ne trebuie pentru a face updateul
    if (status.success) {
      //window.location.reload();//se reincarca pagina
      //displayTeams(allTeams); //ii dam datele vechi si nu va schimmba nimic, ne forteaza sa facem refresh sa se afiseze, in spate serverul face modificarea
      //loadTeams(); //facem load la toata pagina si primesc iar toate echipele => e cosisitor

      allTeams = allTeams.map(t => {
        //creem un nou array
        if (t.id === team.id) {
          //daca elem pe care iteram este cel modificat
          //return team; //returnam echipa noua, cea transmisa spre server
          return {
            ...t, //rastorn tot ce este vechi intr-un array nou
            ...team //rastorn si toate 5 prop din team transmise spre server
            //asa ne asiguram ca nu pierdem nimic din prop vechi ( pentru ca poate nu afisez toate prop in tabel cum e cazul id-ului)
          };
        } //daca avem return nu mai e nevoie de else ca se opreste
        return t; //daca nu, pun elementul vechi
      });
    }
  } else {
    status = await createTeamRequest(team);
    //console.warn("status", status);//primim un status si un id
    if (status.success) {
      //daca statusul este true
      //window.location.reload(); //facem refresh ca sa se redeseneze tabelul cu datele//fara refresh nu se adauga echipa noua in lista
      //Pasi fara reload
      //1. adaugam datele in tabel
      //1.1 adaugam peste echipele vechi echipa noua citita primita ca parametru
      team.id = status.id; //statusul vine si cu id-ul obiectului si il putem folosi de aici
      //allTeams.push(team);
      allTeams = [...allTeams, team]; //nu am adaugat si id-ul pentru ca nu il contine team, de aceea nu va merge delete si edit ( dar se face refresh din cauza lipsei de validari cu succes si a doua oara merge)
      //parantezele patreate creeaza un array nou si rastoarna elementele vechi plus cel nou
    }
  }

  if (status.success) {
    displayTeams(allTeams);
    //2. inca sunt date in input pe care trebuie sa le stergem//daca inca sunt datele in input se apeleaza onSubmit de dopua ori
    e.target.reset(); //propietate pentru submit iar targetul e formularul pentru ca avem eveniment pe onSubmit
    //Varianta asta este mai rapida si nu mai reincarca toata pagina, nu mai afce blink
    //editId = undefined; nu mai avem nevoie de asta deoarece avem in initEvents evenimentul de reset care controleaza si asta
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

function searchTeams(search) {
  return allTeams.filter(team => {
    //return team.promotion === search;//acum verifica ca tot cuvantul sa fie acelasi cu cel scris, nu pot pune doar doua litere si sa dea rezultat
    return team.promotion.indexOf(search) > -1; /// partea din stanga rezulta un numar mai mare de 0 daca gaseste pe o pozitie sirul de caractere din search
  });
}

function initEvents() {
  const form = document.getElementById("editForm"); //vreau sa ascult formularul
  form.addEventListener("submit", onSubmit); //cand o functie este neapelata este de fapt referinta la acea functie ( asta e funxtie pe care ar trebui sa mi-o epeleze eventlistenerul)
  //nu pot da click direct pe x deoarece ei apar mai tarziu decat se executa initEvents()// deci vom asculta un click pe ceva ce exista inainte
  //sa se incarce adica tbody

  form.addEventListener("reset", e => {
    editId = undefined;
  });

  $("#search").addEventListener("input", e => {
    const search = e.target.value; //textul pe care il caut
    const teams = searchTeams(search); //echipele pe care vreau sa le am
    //console.info("search", search, teams);
    displayTeams(teams); //va desena echipele noastre
  });

  $("#teams tbody").addEventListener("click", async e => {
    //diferentiez tagurile de a prin clase
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id; // ia id-ul de pe elementul care s-a dat click// butonul primeste ca id, id-ul echipei
      // deleteTeamRequest(id).then(status => {
      //   if (status.success) {
      //     //window.location.reload();
      //     loadTeams(); //daca sterg ceva se reincarca echipele
      //   }
      // });

      const status = await deleteTeamRequest(id); //rezultatul raspunsului asteptat de la deleteTeamRequest il pstrez in variabila status
      if (status.success) {
        //verific daca are prop success
        loadTeams();
      }
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      prepareEdit(id);
    }
  });
}

loadTeams(); //se va executa mai tarziu decat initEvents()//se porneste si trece la urmatorul
initEvents(); //nu sta pana se incarca loadTeams()

console.info("sleep");
sleep(2000).then(r => {
  console.info("done1", r); //raspunsul e undefined ( ce returneaza functia sleep)//promiseul hotaraste ce imi da mie
});

(() => {
  console.info("start");
})(); // se autoapeleaza datorita parantezelor galbene

(async () => {
  //am o functie asincrona pt care e posibil sa dureze ce am in interir
  console.info("start");
  var r2 = await sleep(2000); //dispare then
  console.warn("done2", r2); //chiar daca nu este in interiorul lui then se executa dupa 2ms datorita lui await
})();
