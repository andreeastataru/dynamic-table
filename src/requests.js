export function loadTeamsRequest() {
  return fetch("http://localhost:3000/teams-json", {
    method: "GET", //cer datele
    headers: {
      "Content-type": "application/json" //precizam ca raspunsul serverului va fi in format json
    }
  }).then(r => r.json());
}

export function createTeamRequest(team) {
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

export function deleteTeamRequest(id) {
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

export function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}
