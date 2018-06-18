const participants = ['Paulig', 'Kalifi', 'Laelli', 'branu', 'Jungleboy', 'Pleksinator'];
const urls = {
  profile: 'https://yle.fi/urheilu/3-10240157#/user/',
  rank: 'https://yle-futistietaja.herokuapp.com/api/rank/',
  matches: 'https://yle-futistietaja.herokuapp.com/api/matches',
  matchResults: 'https://yle-futistietaja.herokuapp.com/api/matchresults/'
}
const table = document.getElementById('results');

function fetchMatches() {
  return fetch(urls.matches)
    .then(res => res.json())
    .then(data => {
      Promise.all(participants.map(nickname => fetchPoints(nickname)))
        .then(points => window.initChart(participants, points))
    })
    .catch(e => console.error(e));
}

function fetchPoints(nickname) {
  return fetch(urls.matchResults + nickname)
    .then(res => res.json())
    .then(data => {
      return data.matchresults
        .reduce((obj, item) => {
          obj[item[0]] = item[1];
          return obj;
        }, {});
    })
    .catch(e => fetchPoints(nickname)); //retry
}

function fetchDetails(nickname) {
  return fetch(urls.rank + nickname)
    .then(res => res.json())
    .then(data => data)
    .catch(e => fetchDetails(nickname)); //retry
}

function addTableRow(nickname, points) {
  const row = table.insertRow();
  const nicknameCell = row.insertCell();
  const a = document.createElement('a');
  a.setAttribute('href', urls.profile + nickname);
  a.innerText = nickname;
  nicknameCell.appendChild(a);

  const pointsCell = row.insertCell();
  pointsCell.innerHTML = points;
}

Promise.all(participants.map(nickname => fetchDetails(nickname)))
  .then(list => list.forEach(obj => addTableRow(obj.nickname, obj.points)));
fetchMatches();