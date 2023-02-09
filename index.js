fetch("teams.json") //aduce date
  .then((r) => r.json()) //transforma
  .then((teams) => {
    //console.info("r1", teams);
    displayTeams(teams);
  });

function displayTeams(teams) {
  console.info("r1", teams);
  const teamsHTML = teams.map(
    //primesc un json si il transform in string
    (team) => ` 
        <tr>
            <td>${team.promotion}</td>
            <td>${team.members}</td>
            <td>${team.name}</td>
            <td>${team.url}</td>
            <td></td>
        </tr>`
  );
  console.info("teamsHTML", teamsHTML);

  document.querySelector("#teams tbody").innerHTML = teamsHTML.join("");
}

//din name vin campurile in network
