import React, { useState, useEffect } from "react";
import axios from "axios";

const Throwball = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [matches, setMatches] = useState([]);
  const [newMatch, setNewMatch] = useState({ name: "", status: "",gender: "",});
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  

  const [isAddPlayerFormVisible, setIsAddPlayerFormVisible] = useState(false);
  const [playerFormData, setPlayerFormData] = useState({
    player_name: "",
    rollNo: "",
    year: "",
    team_status: "",
  });


  const [playersTeamA, setPlayersTeamA] = useState([]);
  const [playersTeamB, setPlayersTeamB] = useState([]);

  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);

  const [footballImage, setFootballImage] = useState(null);


  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');

  const resetMatchForm = () => {
    setNewMatch({ teamA: "", teamB: "", status: "", gender: "" });
  };

  useEffect(() => {
    axios
      .get("http://13.201.93.229:5000/api/auth/getMatches_tw")
      .then((response) => setMatches(response.data))
      .catch((error) => console.error(error));

    axios
      .get(`http://13.201.93.229:5000/api/auth/sportsItems/name/throwball`)
      .then((response) => {
        setFootballImage(response.data.image);
      })
      .catch((error) => {
        console.error("Error fetching football image:", error);
      });

      if (selectedMatch) {
        setTeamAScore(selectedMatch.scoreA[0]?.teamScore || '');
        setTeamBScore(selectedMatch.scoreB[0]?.teamScore || '');
      }

  }, [selectedMatch]);
  
  
  const handleUpdateScore = async (team) => {
    try {
      const matchId = selectedMatch._id;
      let newScore;
      if (team === 'A') {
        newScore = teamAScore;
      } else if (team === 'B') {
        newScore = teamBScore;
      }
  
      // Log request payload
      console.log('Request Payload:', { matchId, team, score: newScore });
  
      // Send update request to backend
      const response = await axios.put(`http://13.201.93.229:5000/api/auth/update-score_tw/${matchId}`, {
        team,
        score: newScore,
      });
  
      console.log(response.data.message); // Log success message

      // Reset input box values to zero after successful update
    if (team === 'A') {
      setTeamAScore('');
    } else if (team === 'B') {
      setTeamBScore('');
    }
    } catch (error) {
      console.error('Error updating score:', error.message);
    }
  };
  
  
  
  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMatch((prevState) => ({
      ...prevState,
      [name]: value,
      name: `${prevState.teamA || "Team A"} VS ${prevState.teamB || "Team B"}`, // Update name field
    }));
  };


  const handleAddMatch = () => {
    if (selectedMatch) {
      // Update existing match
      axios
        .put(
          `http://13.201.93.229:5000/api/auth/updateMatch_tw/${selectedMatch._id}`,
          {
            teamA: newMatch.teamA,
            teamB: newMatch.teamB,
            name: `${newMatch.teamA || "Team A"} VS ${
              newMatch.teamB || "Team B"
            }`,
            status: newMatch.status,
            gender: newMatch.gender,
          }
        )
        .then((response) => {
          setMatches(
            matches.map((match) =>
              match._id === selectedMatch._id ? response.data : match
            )
          );
         setNewMatch({ ...response.data }); // Update newMatch state with response data
        resetMatchForm(); // Reset the match form fields
        //setSelectedMatch(null);
        //setIsFormVisible(false);
        })
        .catch((error) => console.error(error));
    } else {
      // Add new match
      axios
        .post("http://13.201.93.229:5000/api/auth/addMatch_tw", {
          teamA: newMatch.teamA,
          teamB: newMatch.teamB,
          name: `${newMatch.teamA || "Team A"} VS ${
            newMatch.teamB || "Team B"
          }`,
          status: newMatch.status,
          gender: newMatch.gender,
        })
        .then((response) => {
          setMatches([...matches, response.data]);
          //setNewMatch({ ...response.data }); // Update newMatch state with response data
          resetMatchForm(); // Reset the match form fields
        //setIsFormVisible(false);
        })
        .catch((error) => console.error(error));
    }
  };

  const handleDeleteMatch = () => {
    if (selectedMatch) {
      axios
        .delete(
          `http://13.201.93.229:5000/api/auth/deleteMatch_tw/${selectedMatch._id}`
        )
        .then(() => {
          setMatches(
            matches.filter((match) => match._id !== selectedMatch._id)
          );
          setNewMatch({ name: "", status: "", gender: "" });
          setSelectedMatch(null);
          setIsFormVisible(false);
        })
        .catch((error) => console.error(error));
    }
  };

  const handleRowClick = (match) => {
    setSelectedMatch(match);
    setNewMatch({ ...match });

    // Fetch scores for the selected match

    axios
      .get(
        `http://13.201.93.229:5000/api/auth/getPlayers_tw/${match._id}?team=TeamA`
      )
      .then((response) => setPlayersTeamA(response.data))
      .catch((error) => console.error(error));

    axios
      .get(
        `http://13.201.93.229:5000/api/auth/getPlayers_tw/${match._id}?team=TeamB`
      )
      .then((response) => setPlayersTeamB(response.data))
      .catch((error) => console.error(error));
  };
  
  const handleHideForm = () => {
    setNewMatch({ name: "", status: "",gender: "",});
    setSelectedMatch(null);
    setIsFormVisible(false);
  }; 


  const handlePlayerRowClick = (player) => {
    setSelectedPlayerDetails(player);
    setPlayerFormData({
      player_name: player.player_name,
      roll_no: player.roll_no,
      year: player.year,
      team_status: player.team_status,
    });
  };


  const handlePlayerInputChange = (e) => {
    setPlayerFormData({ ...playerFormData, [e.target.name]: e.target.value });
  };


  const handleAddPlayer = () => {
    if (selectedMatch) {
      axios
        .post(
          `http://13.201.93.229:5000/api/auth/addPlayers_tw/${selectedMatch._id}`,
          {
            ...playerFormData,
            rollNo: parseInt(playerFormData.rollNo), // Parse rollNo to integer
            year: parseInt(playerFormData.year), // Parse year to integer
          }
        )
        .then((response) => {
          const updatedPlayers = [...playersTeamA];

          if (playerFormData.team_status === "TeamA") {
            updatedPlayers.push(response.data);
            setPlayersTeamA(updatedPlayers);
          } else if (playerFormData.team_status === "TeamB") {
            const updatedPlayers = [...playersTeamB];
            updatedPlayers.push(response.data);
            setPlayersTeamB(updatedPlayers);
          }

          setPlayerFormData({
            player_name: "",
            roll_no: "",
            year: "",
            team_status: "", // Set default team_status to TeamA
          });
        })
        .catch((error) => console.error(error));
    }
  };

  const handleUpdatePlayer = () => {
    if (selectedMatch && selectedPlayerDetails) {
      const matchId = selectedMatch._id;
      const playerId = selectedPlayerDetails._id;

      // Update existing player
      axios
        .put(
          `http://13.201.93.229:5000/api/auth/updatePlayerDetails_tw/${matchId}/${playerId}`,
          {
            player_name: playerFormData.player_name,
            roll_no: parseInt(playerFormData.roll_no), // Parse rollNo to integer
            year: parseInt(playerFormData.year), // Parse year to integer
            team_status: playerFormData.team_status,
          }
        )
        .then((response) => {
          const updatedPlayer = response.data;

          // Update the corresponding player in the appropriate team
          const updatedPlayers =
            playerFormData.team_status === "TeamA"
              ? playersTeamA.map((player) =>
                  player._id === playerId ? updatedPlayer : player
                )
              : playersTeamB.map((player) =>
                  player._id === playerId ? updatedPlayer : player
                );

          // Set the updated players to the respective state
          playerFormData.team_status === "TeamA"
            ? setPlayersTeamA(updatedPlayers)
            : setPlayersTeamB(updatedPlayers);

          // Reset the form data and selected player details
          setPlayerFormData({
            player_name: "",
            roll_no: "",
            year: "",
            team_status: "", // Set default team_status to TeamA
          });
          setSelectedPlayerDetails(null);
        })
        .catch((error) => console.error(error));
    }
  };

  const handleDeletePlayer = () => {
    if (selectedPlayerDetails) {
      const matchId = selectedMatch._id;
      const playerId = selectedPlayerDetails._id;

      console.log("Player ID:", playerId);
      console.log("Match ID:", matchId);

      if (!playerId || !matchId) {
        console.error("Player ID or Match ID is undefined");
        return;
      }

      axios
        .delete(
          `http://13.201.93.229:5000/api/auth/deletePlayerDetails_tw/${playerId}/${matchId}`
        )
        .then(() => {
          const updatedPlayers =
            selectedPlayerDetails.team_status === "TeamA"
              ? playersTeamA.filter(
                  (player) => player._id !== selectedPlayerDetails._id
                )
              : playersTeamB.filter(
                  (player) => player._id !== selectedPlayerDetails._id
                );

          selectedPlayerDetails.team_status === "TeamA"
            ? setPlayersTeamA(updatedPlayers)
            : setPlayersTeamB(updatedPlayers);

          setPlayerFormData({
            player_name: "",
            roll_no: "",
            year: "",
            team_status: "", // Set default team_status to TeamA
          });
          setSelectedPlayerDetails(null);
        })
        .catch((error) => console.error(error));
    }
  };

  const handleHideAddPlayerForm = () => {
    setIsAddPlayerFormVisible(false);
  };

  const handleToggleAddPlayerForm = () => {
    setIsAddPlayerFormVisible(!isAddPlayerFormVisible);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">THROWBALL Page</h1>
      {/*--------------------------------------------------------------------------------------------------------- */}
      {isAdmin && (
        <div className="mb-3">
          {!isFormVisible ? (
            <button
              onClick={() => setIsFormVisible(true)}
              className="btn btn-primary mr-2"
            >
              Add Matches
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="form-group">
                <label htmlFor="teamA">Team A:</label>
                <input
                  type="text"
                  name="teamA"
                  value={newMatch.teamA}
                  onChange={handleInputChange}
                  className="form-control mr-2"
                />
              </div>
              <div className="form-group">
                <label htmlFor="teamB">Team B:</label>
                <input
                  type="text"
                  name="teamB"
                  value={newMatch.teamB}
                  onChange={handleInputChange}
                  className="form-control mr-2"
                />
              </div>

              </div>
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <select
                  name="status"
                  value={newMatch.status}
                  onChange={handleInputChange}
                  className="form-control mr-2"
                >
                  <option value="select">Select</option>
                  <option value="previous">Previous</option>
                  <option value="present">Present</option>
                  <option value="upcomming">upcomming</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender:</label>
                <select
                  name="gender"
                  value={newMatch.gender}
                  onChange={handleInputChange}
                  className="form-control mr-2"
                >
                  <option value="select">Select</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
              </div>

              <button onClick={handleAddMatch} className="btn btn-primary mr-2">
                {selectedMatch ? "Update Match" : "Add Match"}
              </button>

              {selectedMatch && (
                <button
                  onClick={handleDeleteMatch}
                  className="btn btn-danger mr-2"
                >
                  Delete Match
                </button>
              )}

              <button onClick={handleHideForm} className="btn btn-secondary">
                Hide
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      <div>
        <h2>Boys Matches</h2>
        <div className="row">
          <div className="col-md-4">
            <h4>Previous</h4>
            <ul className="list-group">
              {matches
                .filter(
                  (match) => match.status === "previous" && match.gender === "boys"
                )
                .map((match) => (
                  <li
                    key={match._id}
                    className={`list-group-item ${
                      selectedMatch && selectedMatch._id === match._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleRowClick(match)}
                  >
                    {match.name}
                  </li>
                ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Today</h4>
            <ul className="list-group">
              {matches
                .filter(
                  (match) =>
                    match.status === "present" && match.gender === "boys"
                )
                .map((match) => (
                  <li
                    key={match._id}
                    className={`list-group-item ${
                      selectedMatch && selectedMatch._id === match._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleRowClick(match)}
                  >
                    {match.name}
                  </li>
                ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Upcomming</h4>
            <ul className="list-group">
              {matches
                .filter(
                  (match) =>
                    match.status === "upcomming" && match.gender === "boys"
                )
                .map((match) => (
                  <li
                    key={match._id}
                    className={`list-group-item ${
                      selectedMatch && selectedMatch._id === match._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleRowClick(match)}
                  >
                    {match.name}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Girls Matches */}
      <div>
        <h2>Girls Matches</h2>
        <div className="row">
          <div className="col-md-4">
            <h4>Previous</h4>
            <ul className="list-group">
              {matches
                .filter(
                  (match) => match.status === "previous" && match.gender === "girls"
                )
                .map((match) => (
                  <li
                    key={match._id}
                    className={`list-group-item ${
                      selectedMatch && selectedMatch._id === match._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleRowClick(match)}
                  >
                    {match.name}
                  </li>
                ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Today</h4>
            <ul className="list-group">
              {matches
                .filter(
                  (match) =>
                    match.status === "present" && match.gender === "girls"
                )
                .map((match) => (
                  <li
                    key={match._id}
                    className={`list-group-item ${
                      selectedMatch && selectedMatch._id === match._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleRowClick(match)}
                  >
                    {match.name}
                  </li>
                ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Upcomming</h4>
            <ul className="list-group">
              {matches
                .filter(
                  (match) =>
                    match.status === "upcomming" && match.gender === "girls"
                )
                .map((match) => (
                  <li
                    key={match._id}
                    className={`list-group-item ${
                      selectedMatch && selectedMatch._id === match._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleRowClick(match)}
                  >
                    {match.name}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      { selectedMatch && (
        <div className="mt-4">
        <h3>Score Details</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Teams</th>
              <th>Score</th>
              {isAdmin && selectedMatch &&(
                <th>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {selectedMatch && (
              <>
<tr>
      <td>{selectedMatch.teamA}</td>
      <td>{selectedMatch.scoreA[0]?.teamAScore}</td>
      {isAdmin && selectedMatch && (
        <td>
        <input
          type="number"
          value={teamAScore}
          onChange={(e) => setTeamAScore(e.target.value)}
        />
        <button onClick={() => handleUpdateScore('A')}>Update Score</button>
      </td>

      )}
      
    </tr>
    <tr>
      <td>{selectedMatch.teamB}</td>
      <td>{selectedMatch.scoreB[0]?.teamBScore}</td>
      {isAdmin && selectedMatch && (
        <td>
        <input
          type="number"
          value={teamBScore}
          onChange={(e) => setTeamBScore(e.target.value)}
        />
        <button onClick={() => handleUpdateScore('B')}>Update Score</button>
      </td>
      )}
    </tr>
              </>
            )}
            {/* Your existing JSX */}
          </tbody>
        </table>
      </div>
      )}
{/* Score Details */}



      {/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      <div className="mt-4">
        <h3>Players Details</h3>

        <div className="row">
          <div className="col-md-6">
            <div>
              <h4>{selectedMatch && selectedMatch.teamA} Players</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Roll No</th>
                  </tr>
                </thead>
                <tbody>
                  {playersTeamA.map((player, index) => (
                    <tr
                      key={index}
                      onClick={() => handlePlayerRowClick(player)}
                    >
                      <td>{index + 1}</td>
                      <td>{player.player_name}</td>
                      <td>{player.year}</td>
                      <td>{player.roll_no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6">
            <div>
            <h4>{selectedMatch && selectedMatch.teamB} Players</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Roll No</th>
                  </tr>
                </thead>
                <tbody>
                  {playersTeamB.map((player, index) => (
                    <tr
                      key={index}
                      onClick={() => handlePlayerRowClick(player)}
                    >
                      <td>{index + 1}</td>
                      <td>{player.player_name}</td>
                      <td>{player.year}</td>
                      <td>{player.roll_no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isAdmin && selectedMatch && isAddPlayerFormVisible && (
          <div className="form-row">
            <div className="form-group col-md-3">
              <label>Player Name:</label>
              <input
                type="text"
                name="player_name"
                value={playerFormData.player_name}
                onChange={handlePlayerInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group col-md-3">
              <label>Roll No:</label>
              <input
                type="number"
                name="roll_no"
                value={playerFormData.roll_no}
                onChange={handlePlayerInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group col-md-3">
              <label>Year:</label>
              <input
                type="number"
                name="year"
                value={playerFormData.year}
                onChange={handlePlayerInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group col-md-3">
              <label>Team:</label>
              <select
                name="team_status"
                value={playerFormData.team_status}
                onChange={handlePlayerInputChange}
                className="form-control"
              >
                <option value="select">Select</option>
                <option value="TeamA">TeamA</option>
                <option value="TeamB">TeamB</option>
              </select>
            </div>
            <div className="form-group col-md-12">
              <button onClick={handleAddPlayer} className="btn btn-danger mr-2">
                Add Player
              </button>
              <button
                onClick={handleUpdatePlayer}
                className="btn btn-danger mr-2"
              >
                Update Player
              </button>
              <button
                onClick={handleDeletePlayer}
                className="btn btn-danger mr-2"
              >
                Delete Player
              </button>
              <button
                onClick={handleHideAddPlayerForm}
                className="btn btn-secondary"
              >
                Hide
              </button>
            </div>
          </div>
        )}

        {/* Toggle Add Player Form Button */}
        {isAdmin && selectedMatch && !isAddPlayerFormVisible && (
          <button
            onClick={handleToggleAddPlayerForm}
            className="btn btn-success mt-2"
          >
            Add Player
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        {footballImage && (
          <img
            src={`data:image/jpeg;base64,${footballImage}`}
            alt="Football"
            style={{ maxWidth: "70%", maxHeight: "70%" }}
          />
        )}
      </div>
      
    </div>
  );
};

export default Throwball;
