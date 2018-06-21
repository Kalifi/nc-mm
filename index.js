const participants = ['Paulig', 'Kalifi', 'Laelli', 'branu', 'Jungleboy', 'Pleksinator'];
const urls = {
  profile: 'https://yle.fi/urheilu/3-10240157#/user/',
  rank: 'https://yle-futistietaja.herokuapp.com/api/rank/',
  matches: 'https://yle-futistietaja.herokuapp.com/api/matches',
  matchResults: 'https://yle-futistietaja.herokuapp.com/api/matchresults/',
  answer: 'https://yle-futistietaja.herokuapp.com/api/answer/'
}
const table = document.getElementById('results');
const guessTable = document.getElementById('guesses');

function fetchMatches() {
   return fetch(urls.matches)
    .then(res => res.json())
    .then(data => data.reduce((acc, group) => {
      for (let match of group.matches) {
        if (match.status === 'finished')
          acc[0].push(match);
        else
          acc[1].push(match);
      }
      return acc;
    }, [[], []]))
    .catch(e => console.error(e));
}

function fetchPoints(nickname) {
  return fetch(urls.matchResults + nickname)
    .then(res => res.json())
    .then(data => ({
      name: data.nickname,
      points: data.matchresults.map(p => ({id: p[0], points: p[1]}))
    }))
    .catch(e => fetchPoints(nickname)); //retry
}

function fetchAnswers(nickname) {
  return fetch(urls.answer + nickname)
    .then(res => res.json())
    .then(data => ({
      name: data.nickname,
      goals: data.values.matchTeamGoals
    }))
    .catch(e => console.error(e));
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

function addGuessRow(nickname, home, guest) {
  const row = guessTable.insertRow();
  const nicknameCell = row.insertCell();
  nicknameCell.innerHTML = nickname;

  const scoreCell = row.insertCell();
  scoreCell.innerHTML = home + ' - ' + guest;
}

Promise.all(participants.map(nickname => fetchDetails(nickname)))
  .then(list => list.forEach(obj => addTableRow(obj.nickname, obj.points)));

Promise.all([fetchMatches(), Promise.all(participants.map(nickname => fetchPoints(nickname))), Promise.all(participants.map(nickname => fetchAnswers(nickname)))])
  .then(([matches, points, answers]) => {
    const sortedMatches = matches[0].sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((acc, match) => {
        acc[0].push(match.id);
        acc[1].push(match.name);
        return acc;
      }, [[], []]);
    
    const nextMatch = matches[1].sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    document.getElementById('next-match').innerHTML = nextMatch.name;
    answers.map(participant => {
      const guesses = participant.goals.filter(i => i.matchId === nextMatch.id);
      addGuessRow(participant.name, guesses[0].goals, guesses[1].goals);
    })

    points.map(participant => {
      let sortedPoints = [];
      for(const id of sortedMatches[0]) {
        sortedPoints.push(participant.points.find(e => e.id === id).points);
      }
      participant.points = getCumulativePoints(sortedPoints);
    })
    
    window.initChart(sortedMatches[1], points);
  });