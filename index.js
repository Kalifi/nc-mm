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
    .then(data => parseMatches(data))
    .catch(e => console.error(e));
}

function parseMatches(matches) {
  return matches.reduce((acc, group) => {
    const groupMatches = group.matches.filter(match => match.status === 'finished')
      .map(match => match.name)
    return acc.concat(groupMatches);
  }, []);
}

function fetchPoints(nickname) {
  return fetch(urls.matchResults + nickname)
    .then(res => res.json())
    .then(data => {
      return {
        name: data.nickname,
        points: parsePoints(data.matchresults)
      }
    })
    .catch(e => fetchPoints(nickname)); //retry
}

function parsePoints(matchresults) {
  return getCumulativePoints(matchresults.map(item => item[1]));
}

function getCumulativePoints(points) {
  return points.reduce((r, a) => {
    r.push((r.length && r[r.length - 1] || 0) + a);
    return r;
  }, []);
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

Promise.all([fetchMatches(), Promise.all(participants.map(nickname => fetchPoints(nickname)))])
  .then(([matches, points]) => window.initChart(matches, points));