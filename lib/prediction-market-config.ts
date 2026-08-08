import {
  PredictionMarkets,
} from './prediction-enums';



export interface PredictionSelectionOption {

  label: string;

  value: string;

}



export interface PredictionMarketOption {

  label: string;

  value: string;

  selections: PredictionSelectionOption[];

}



// ==================================================
// PREDICTION MARKET CONFIGURATION
// ==================================================

export const PredictionMarketOptions:
PredictionMarketOption[] = [


// ==================================================
// GOALS
// ==================================================

{
  label:'Over / Under Goals',
  value:PredictionMarkets.OVER_UNDER,

  selections:[


    {
      label:'Over 0.5 Goals',
      value:'OVER_0_5',
    },

    {
      label:'Over 1.5 Goals',
      value:'OVER_1_5',
    },

    {
      label:'Over 2.5 Goals',
      value:'OVER_2_5',
    },

    {
      label:'Over 3.5 Goals',
      value:'OVER_3_5',
    },

    {
      label:'Over 4.5 Goals',
      value:'OVER_4_5',
    },

    {
      label:'Over 5.5 Goals',
      value:'OVER_5_5',
    },


    {
      label:'Under 0.5 Goals',
      value:'UNDER_0_5',
    },

    {
      label:'Under 1.5 Goals',
      value:'UNDER_1_5',
    },

    {
      label:'Under 2.5 Goals',
      value:'UNDER_2_5',
    },

    {
      label:'Under 3.5 Goals',
      value:'UNDER_3_5',
    },

    {
      label:'Under 4.5 Goals',
      value:'UNDER_4_5',
    },

    {
      label:'Under 5.5 Goals',
      value:'UNDER_5_5',
    },


  ],
},

// ==================================================
// BOTH TEAMS TO SCORE
// ==================================================

{
  label:'Both Teams To Score',
  value:PredictionMarkets.BOTH_TEAMS_TO_SCORE,

  selections:[

    {
      label:'Yes',
      value:'BTTS_YES',
    },

    {
      label:'No',
      value:'BTTS_NO',
    },

  ],
},

// ==================================================
// DOUBLE CHANCE
// ==================================================

{
  label:'Double Chance',
  value:PredictionMarkets.DOUBLE_CHANCE,

  selections:[


    {
      label:'Home or Draw',
      value:'HOME_DRAW',
    },


    {
      label:'Draw or Away',
      value:'DRAW_AWAY',
    },


    {
      label:'Home or Away',
      value:'HOME_AWAY',
    },


  ],
},

// ==================================================
// DRAW NO BET
// ==================================================

{
  label:'Draw No Bet',
  value:PredictionMarkets.DRAW_NO_BET,

  selections:[


    {
      label:'Home',
      value:'HOME',
    },


    {
      label:'Away',
      value:'AWAY',
    },


  ],
},

// ==================================================
// GOAL RANGE
// ==================================================

{
  label:'Goal Range',
  value:PredictionMarkets.GOAL_RANGE,

  selections:[


    {
      label:'0 - 1 Goals',
      value:'GOALS_0_1',
    },


    {
      label:'2 - 3 Goals',
      value:'GOALS_2_3',
    },


    {
      label:'4 - 5 Goals',
      value:'GOALS_4_5',
    },


    {
      label:'6+ Goals',
      value:'GOALS_6_PLUS',
    },


  ],
},

// ==================================================
// TEAM TOTAL GOALS
// ==================================================

{
  label:'Team Total Goals',
  value:PredictionMarkets.TEAM_TOTAL_GOALS,

  selections:[


    {
      label:'Home Over 0.5 Goals',
      value:'HOME_OVER_0_5',
    },


    {
      label:'Home Over 1.5 Goals',
      value:'HOME_OVER_1_5',
    },


    {
      label:'Home Over 2.5 Goals',
      value:'HOME_OVER_2_5',
    },


    {
      label:'Home Under 0.5 Goals',
      value:'HOME_UNDER_0_5',
    },


    {
      label:'Home Under 1.5 Goals',
      value:'HOME_UNDER_1_5',
    },


    {
      label:'Home Under 2.5 Goals',
      value:'HOME_UNDER_2_5',
    },



    {
      label:'Away Over 0.5 Goals',
      value:'AWAY_OVER_0_5',
    },


    {
      label:'Away Over 1.5 Goals',
      value:'AWAY_OVER_1_5',
    },


    {
      label:'Away Over 2.5 Goals',
      value:'AWAY_OVER_2_5',
    },


    {
      label:'Away Under 0.5 Goals',
      value:'AWAY_UNDER_0_5',
    },


    {
      label:'Away Under 1.5 Goals',
      value:'AWAY_UNDER_1_5',
    },


    {
      label:'Away Under 2.5 Goals',
      value:'AWAY_UNDER_2_5',
    },


  ],
},

// ==================================================
// HALF TIME RESULT
// ==================================================

{
  label:'Half Time Result',
  value:PredictionMarkets.HALF_TIME_RESULT,

  selections:[


    {
      label:'Home Win',
      value:'HOME_WIN',
    },


    {
      label:'Draw',
      value:'DRAW',
    },


    {
      label:'Away Win',
      value:'AWAY_WIN',
    },


  ],
},

// ==================================================
// HALF TIME / FULL TIME
// ==================================================

{
  label:'Half Time / Full Time',
  value:PredictionMarkets.HALF_TIME_FULL_TIME,

  selections:[


    {
      label:'Home / Home',
      value:'HOME_HOME',
    },


    {
      label:'Home / Draw',
      value:'HOME_DRAW',
    },


    {
      label:'Home / Away',
      value:'HOME_AWAY',
    },



    {
      label:'Draw / Home',
      value:'DRAW_HOME',
    },


    {
      label:'Draw / Draw',
      value:'DRAW_DRAW',
    },


    {
      label:'Draw / Away',
      value:'DRAW_AWAY',
    },



    {
      label:'Away / Home',
      value:'AWAY_HOME',
    },


    {
      label:'Away / Draw',
      value:'AWAY_DRAW',
    },


    {
      label:'Away / Away',
      value:'AWAY_AWAY',
    },


  ],
},

// ==================================================
// SECOND HALF RESULT
// ==================================================

{
  label:'Second Half Result',
  value:PredictionMarkets.SECOND_HALF_RESULT,

  selections:[


    {
      label:'Home Win',
      value:'HOME_WIN',
    },


    {
      label:'Draw',
      value:'DRAW',
    },


    {
      label:'Away Win',
      value:'AWAY_WIN',
    },


  ],
},

// ==================================================
// ASIAN HANDICAP
// ==================================================

{
  label:'Asian Handicap',
  value:PredictionMarkets.ASIAN_HANDICAP,

  selections:[


    {
      label:'Home -2.5',
      value:'HOME_MINUS_2_5',
    },

    {
      label:'Home -1.5',
      value:'HOME_MINUS_1_5',
    },

    {
      label:'Home -1',
      value:'HOME_MINUS_1',
    },

    {
      label:'Home -0.5',
      value:'HOME_MINUS_0_5',
    },


    {
      label:'Away +0.5',
      value:'AWAY_PLUS_0_5',
    },

    {
      label:'Away +1',
      value:'AWAY_PLUS_1',
    },

    {
      label:'Away +1.5',
      value:'AWAY_PLUS_1_5',
    },

    {
      label:'Away +2.5',
      value:'AWAY_PLUS_2_5',
    },


  ],
},

// ==================================================
// EUROPEAN HANDICAP
// ==================================================

{
  label:'European Handicap',
  value:PredictionMarkets.EUROPEAN_HANDICAP,

  selections:[


    {
      label:'Home -2',
      value:'HOME_MINUS_2',
    },


    {
      label:'Home -1',
      value:'HOME_MINUS_1',
    },


    {
      label:'Home +1',
      value:'HOME_PLUS_1',
    },


    {
      label:'Away -2',
      value:'AWAY_MINUS_2',
    },


    {
      label:'Away -1',
      value:'AWAY_MINUS_1',
    },


    {
      label:'Away +1',
      value:'AWAY_PLUS_1',
    },


  ],
},

// ==================================================
// CORNERS TOTAL
// ==================================================

{
  label:'Total Corners',
  value:PredictionMarkets.CORNERS_TOTAL,

  selections:[


    {
      label:'Over 7.5 Corners',
      value:'OVER_7_5',
    },


    {
      label:'Over 8.5 Corners',
      value:'OVER_8_5',
    },


    {
      label:'Over 9.5 Corners',
      value:'OVER_9_5',
    },


    {
      label:'Over 10.5 Corners',
      value:'OVER_10_5',
    },


    {
      label:'Over 11.5 Corners',
      value:'OVER_11_5',
    },


    {
      label:'Under 7.5 Corners',
      value:'UNDER_7_5',
    },


    {
      label:'Under 8.5 Corners',
      value:'UNDER_8_5',
    },


    {
      label:'Under 9.5 Corners',
      value:'UNDER_9_5',
    },


    {
      label:'Under 10.5 Corners',
      value:'UNDER_10_5',
    },


    {
      label:'Under 11.5 Corners',
      value:'UNDER_11_5',
    },


  ],
},

// ==================================================
// TEAM CORNERS
// ==================================================

{
  label:'Team Corners',
  value:PredictionMarkets.TEAM_CORNERS,

  selections:[


    {
      label:'Home Over 3.5 Corners',
      value:'HOME_OVER_3_5',
    },


    {
      label:'Home Over 4.5 Corners',
      value:'HOME_OVER_4_5',
    },


    {
      label:'Home Over 5.5 Corners',
      value:'HOME_OVER_5_5',
    },


    {
      label:'Home Under 3.5 Corners',
      value:'HOME_UNDER_3_5',
    },


    {
      label:'Home Under 4.5 Corners',
      value:'HOME_UNDER_4_5',
    },


    {
      label:'Home Under 5.5 Corners',
      value:'HOME_UNDER_5_5',
    },



    {
      label:'Away Over 3.5 Corners',
      value:'AWAY_OVER_3_5',
    },


    {
      label:'Away Over 4.5 Corners',
      value:'AWAY_OVER_4_5',
    },


    {
      label:'Away Over 5.5 Corners',
      value:'AWAY_OVER_5_5',
    },


    {
      label:'Away Under 3.5 Corners',
      value:'AWAY_UNDER_3_5',
    },


    {
      label:'Away Under 4.5 Corners',
      value:'AWAY_UNDER_4_5',
    },


    {
      label:'Away Under 5.5 Corners',
      value:'AWAY_UNDER_5_5',
    },


  ],
},

// ==================================================
// CORNER HANDICAP
// ==================================================

{
  label:'Corner Handicap',
  value:PredictionMarkets.CORNER_HANDICAP,

  selections:[


    {
      label:'Home -2 Corners',
      value:'HOME_MINUS_2',
    },


    {
      label:'Home -3 Corners',
      value:'HOME_MINUS_3',
    },


    {
      label:'Home -4 Corners',
      value:'HOME_MINUS_4',
    },


    {
      label:'Away +2 Corners',
      value:'AWAY_PLUS_2',
    },


    {
      label:'Away +3 Corners',
      value:'AWAY_PLUS_3',
    },


    {
      label:'Away +4 Corners',
      value:'AWAY_PLUS_4',
    },


  ],
},

// ==================================================
// CARDS TOTAL
// ==================================================

{
  label:'Total Cards',
  value:PredictionMarkets.CARDS_TOTAL,

  selections:[


    {
      label:'Over 2.5 Cards',
      value:'OVER_2_5',
    },


    {
      label:'Over 3.5 Cards',
      value:'OVER_3_5',
    },


    {
      label:'Over 4.5 Cards',
      value:'OVER_4_5',
    },


    {
      label:'Over 5.5 Cards',
      value:'OVER_5_5',
    },


    {
      label:'Over 6.5 Cards',
      value:'OVER_6_5',
    },


    {
      label:'Under 2.5 Cards',
      value:'UNDER_2_5',
    },


    {
      label:'Under 3.5 Cards',
      value:'UNDER_3_5',
    },


    {
      label:'Under 4.5 Cards',
      value:'UNDER_4_5',
    },


    {
      label:'Under 5.5 Cards',
      value:'UNDER_5_5',
    },


    {
      label:'Under 6.5 Cards',
      value:'UNDER_6_5',
    },


  ],
},

// ==================================================
// TEAM CARDS
// ==================================================

{
  label:'Team Cards',
  value:PredictionMarkets.TEAM_CARDS,

  selections:[


    {
      label:'Home Over 1.5 Cards',
      value:'HOME_OVER_1_5',
    },


    {
      label:'Home Over 2.5 Cards',
      value:'HOME_OVER_2_5',
    },


    {
      label:'Home Over 3.5 Cards',
      value:'HOME_OVER_3_5',
    },


    {
      label:'Home Under 1.5 Cards',
      value:'HOME_UNDER_1_5',
    },


    {
      label:'Home Under 2.5 Cards',
      value:'HOME_UNDER_2_5',
    },


    {
      label:'Home Under 3.5 Cards',
      value:'HOME_UNDER_3_5',
    },



    {
      label:'Away Over 1.5 Cards',
      value:'AWAY_OVER_1_5',
    },


    {
      label:'Away Over 2.5 Cards',
      value:'AWAY_OVER_2_5',
    },


    {
      label:'Away Over 3.5 Cards',
      value:'AWAY_OVER_3_5',
    },


    {
      label:'Away Under 1.5 Cards',
      value:'AWAY_UNDER_1_5',
    },


    {
      label:'Away Under 2.5 Cards',
      value:'AWAY_UNDER_2_5',
    },


    {
      label:'Away Under 3.5 Cards',
      value:'AWAY_UNDER_3_5',
    },


  ],
},

// ==================================================
// CARD HANDICAP
// ==================================================

{
  label:'Card Handicap',
  value:PredictionMarkets.CARD_HANDICAP,

  selections:[


    {
      label:'Home -1 Card',
      value:'HOME_MINUS_1',
    },


    {
      label:'Home -2 Cards',
      value:'HOME_MINUS_2',
    },


    {
      label:'Home -3 Cards',
      value:'HOME_MINUS_3',
    },


    {
      label:'Away +1 Card',
      value:'AWAY_PLUS_1',
    },


    {
      label:'Away +2 Cards',
      value:'AWAY_PLUS_2',
    },


    {
      label:'Away +3 Cards',
      value:'AWAY_PLUS_3',
    },


  ],
},

// ==================================================
// ANYTIME GOALSCORER
// ==================================================

{
  label:'Anytime Goalscorer',
  value:PredictionMarkets.ANYTIME_GOALSCORER,

  selections:[

    // Player name will be dynamic
    // Example:
    // Erling Haaland
    // Mohamed Salah
    // Kylian Mbappe

    {
      label:'Player',
      value:'PLAYER_ID',
    },

  ],
},

// ==================================================
// FIRST GOALSCORER
// ==================================================

{
  label:'First Goalscorer',
  value:PredictionMarkets.FIRST_GOALSCORER,

  selections:[

    // Player name will be dynamic
    // Example:
    // Erling Haaland
    // Mohamed Salah
    // Kylian Mbappe

    {
      label:'Player',
      value:'PLAYER_ID',
    },

  ],
},

// ==================================================
// PLAYER SHOTS
// ==================================================

{
  label:'Player Shots',
  value:PredictionMarkets.PLAYER_SHOTS,

  selections:[


    // Player name will be dynamic
    // Example:
    // Erling Haaland - Over 2.5 Shots
    // Mohamed Salah - Under 2.5 Shots


    {
      label:'Player Over 1.5 Shots',
      value:'PLAYER_OVER_1_5_SHOTS',
    },


    {
      label:'Player Over 2.5 Shots',
      value:'PLAYER_OVER_2_5_SHOTS',
    },


    {
      label:'Player Over 3.5 Shots',
      value:'PLAYER_OVER_3_5_SHOTS',
    },


    {
      label:'Player Under 1.5 Shots',
      value:'PLAYER_UNDER_1_5_SHOTS',
    },


    {
      label:'Player Under 2.5 Shots',
      value:'PLAYER_UNDER_2_5_SHOTS',
    },


    {
      label:'Player Under 3.5 Shots',
      value:'PLAYER_UNDER_3_5_SHOTS',
    },


  ],
},

// ==================================================
// PLAYER SHOTS ON TARGET
// ==================================================

{
  label:'Player Shots On Target',
  value:PredictionMarkets.PLAYER_SHOTS_ON_TARGET,

  selections:[


    // Player name will be dynamic
    // Example:
    // Erling Haaland - Over 1.5 Shots On Target


    {
      label:'Player Over 0.5 Shots On Target',
      value:'PLAYER_OVER_0_5_SOT',
    },


    {
      label:'Player Over 1.5 Shots On Target',
      value:'PLAYER_OVER_1_5_SOT',
    },


    {
      label:'Player Over 2.5 Shots On Target',
      value:'PLAYER_OVER_2_5_SOT',
    },


    {
      label:'Player Under 0.5 Shots On Target',
      value:'PLAYER_UNDER_0_5_SOT',
    },


    {
      label:'Player Under 1.5 Shots On Target',
      value:'PLAYER_UNDER_1_5_SOT',
    },


    {
      label:'Player Under 2.5 Shots On Target',
      value:'PLAYER_UNDER_2_5_SOT',
    },


  ],
},

// ==================================================
// PLAYER ASSISTS
// ==================================================

{
  label:'Player Assists',
  value:PredictionMarkets.PLAYER_ASSISTS,

  selections:[


    // Player name will be dynamic
    // Example:
    // Kevin De Bruyne - Over 0.5 Assists


    {
      label:'Player Over 0.5 Assists',
      value:'PLAYER_OVER_0_5_ASSISTS',
    },


    {
      label:'Player Over 1.5 Assists',
      value:'PLAYER_OVER_1_5_ASSISTS',
    },


    {
      label:'Player Under 0.5 Assists',
      value:'PLAYER_UNDER_0_5_ASSISTS',
    },


    {
      label:'Player Under 1.5 Assists',
      value:'PLAYER_UNDER_1_5_ASSISTS',
    },


  ],
},

// ==================================================
// FIRST GOAL
// ==================================================

{
  label:'First Goal',
  value:PredictionMarkets.FIRST_GOAL,

  selections:[


    {
      label:'Home Team Scores First',
      value:'HOME_SCORES_FIRST',
    },


    {
      label:'No Goal',
      value:'NO_GOAL',
    },


    {
      label:'Away Team Scores First',
      value:'AWAY_SCORES_FIRST',
    },


  ],
},

// ==================================================
// LAST GOAL
// ==================================================

{
  label:'Last Goal',
  value:PredictionMarkets.LAST_GOAL,

  selections:[


    {
      label:'Home Team Scores Last',
      value:'HOME_SCORES_LAST',
    },


    {
      label:'No Goal',
      value:'NO_GOAL',
    },


    {
      label:'Away Team Scores Last',
      value:'AWAY_SCORES_LAST',
    },


  ],
},

// ==================================================
// WIN TO NIL
// ==================================================

{
  label:'Win To Nil',
  value:PredictionMarkets.WIN_TO_NIL,

  selections:[


    {
      label:'Home Win To Nil',
      value:'HOME_WIN_TO_NIL',
    },


    {
      label:'Away Win To Nil',
      value:'AWAY_WIN_TO_NIL',
    },


  ],
},

// ==================================================
// CORRECT SCORE
// ==================================================

{
  label:'Correct Score',
  value:PredictionMarkets.CORRECT_SCORE,

  selections:[


    {
      label:'0 - 0',
      value:'0_0',
    },


    {
      label:'1 - 0',
      value:'1_0',
    },


    {
      label:'2 - 0',
      value:'2_0',
    },


    {
      label:'3 - 0',
      value:'3_0',
    },


    {
      label:'1 - 1',
      value:'1_1',
    },


    {
      label:'2 - 1',
      value:'2_1',
    },


    {
      label:'3 - 1',
      value:'3_1',
    },


    {
      label:'2 - 2',
      value:'2_2',
    },


    {
      label:'0 - 1',
      value:'0_1',
    },


    {
      label:'0 - 2',
      value:'0_2',
    },


    {
      label:'0 - 3',
      value:'0_3',
    },


    {
      label:'1 - 2',
      value:'1_2',
    },


    {
      label:'1 - 3',
      value:'1_3',
    },


    {
      label:'3 - 2',
      value:'3_2',
    },


    {
      label:'Other Score',
      value:'OTHER_SCORE',
    },


  ],
},

// ==================================================
// CLEAN SHEET
// ==================================================

{
  label:'Clean Sheet',
  value:PredictionMarkets.CLEAN_SHEET,

  selections:[


    {
      label:'Home Team Clean Sheet',
      value:'HOME_CLEAN_SHEET',
    },


    {
      label:'Away Team Clean Sheet',
      value:'AWAY_CLEAN_SHEET',
    },


    {
      label:'Both Teams Keep Clean Sheet',
      value:'BOTH_CLEAN_SHEET',
    },


    {
      label:'No Clean Sheet',
      value:'NO_CLEAN_SHEET',
    },


  ],
},

// ==================================================
// POSSESSION WINNER
// ==================================================

{
  label:'Possession Winner',
  value:PredictionMarkets.POSSESSION_WINNER,

  selections:[


    {
      label:'Home Team Has More Possession',
      value:'HOME_POSSESSION_WINNER',
    },


    {
      label:'Away Team Has More Possession',
      value:'AWAY_POSSESSION_WINNER',
    },


  ],
},

// ==================================================
// MOST SHOTS
// ==================================================

{
  label:'Most Shots',
  value:PredictionMarkets.MOST_SHOTS,

  selections:[


    {
      label:'Home Team Has More Shots',
      value:'HOME_MOST_SHOTS',
    },


    {
      label:'Away Team Has More Shots',
      value:'AWAY_MOST_SHOTS',
    },


    {
      label:'Equal Shots',
      value:'EQUAL_SHOTS',
    },


  ],
},

// ==================================================
// MOST SHOTS ON TARGET
// ==================================================

{
  label:'Most Shots On Target',
  value:PredictionMarkets.MOST_SHOTS_ON_TARGET,

  selections:[


    {
      label:'Home Team Has More Shots On Target',
      value:'HOME_MOST_SHOTS_ON_TARGET',
    },


    {
      label:'Away Team Has More Shots On Target',
      value:'AWAY_MOST_SHOTS_ON_TARGET',
    },


    {
      label:'Equal Shots On Target',
      value:'EQUAL_SHOTS_ON_TARGET',
    },


  ],
},

// ==================================================
// FIRST HALF GOALS
// ==================================================

{
  label:'First Half Goals',
  value:PredictionMarkets.FIRST_HALF_GOALS,

  selections:[


    {
      label:'Over 0.5 First Half Goals',
      value:'OVER_0_5',
    },


    {
      label:'Over 1.5 First Half Goals',
      value:'OVER_1_5',
    },


    {
      label:'Over 2.5 First Half Goals',
      value:'OVER_2_5',
    },


    {
      label:'Under 0.5 First Half Goals',
      value:'UNDER_0_5',
    },


    {
      label:'Under 1.5 First Half Goals',
      value:'UNDER_1_5',
    },


    {
      label:'Under 2.5 First Half Goals',
      value:'UNDER_2_5',
    },


  ],
},

// ==================================================
// SECOND HALF GOALS
// ==================================================

{
  label:'Second Half Goals',
  value:PredictionMarkets.SECOND_HALF_GOALS,

  selections:[


    {
      label:'Over 0.5 Second Half Goals',
      value:'OVER_0_5',
    },


    {
      label:'Over 1.5 Second Half Goals',
      value:'OVER_1_5',
    },


    {
      label:'Over 2.5 Second Half Goals',
      value:'OVER_2_5',
    },


    {
      label:'Under 0.5 Second Half Goals',
      value:'UNDER_0_5',
    },


    {
      label:'Under 1.5 Second Half Goals',
      value:'UNDER_1_5',
    },


    {
      label:'Under 2.5 Second Half Goals',
      value:'UNDER_2_5',
    },


  ],
},

// ==================================================
// GOAL TIMING
// ==================================================

{
  label:'Goal Timing',
  value:PredictionMarkets.GOAL_TIMING,

  selections:[


    {
      label:'Goal Before 15 Minutes',
      value:'GOAL_BEFORE_15',
    },


    {
      label:'Goal Between 16 - 30 Minutes',
      value:'GOAL_16_30',
    },


    {
      label:'Goal Between 31 - 45 Minutes',
      value:'GOAL_31_45',
    },


    {
      label:'Goal Between 46 - 60 Minutes',
      value:'GOAL_46_60',
    },


    {
      label:'Goal Between 61 - 75 Minutes',
      value:'GOAL_61_75',
    },


    {
      label:'Goal Between 76 - 90 Minutes',
      value:'GOAL_76_90',
    },


    {
      label:'No Goal',
      value:'NO_GOAL',
    },


  ],
},

// ==================================================
// FIRST HALF CORNERS
// ==================================================

{
  label:'First Half Corners',
  value:PredictionMarkets.FIRST_HALF_CORNERS,

  selections:[


    {
      label:'Over 2.5 First Half Corners',
      value:'OVER_2_5',
    },


    {
      label:'Over 3.5 First Half Corners',
      value:'OVER_3_5',
    },


    {
      label:'Over 4.5 First Half Corners',
      value:'OVER_4_5',
    },


    {
      label:'Under 2.5 First Half Corners',
      value:'UNDER_2_5',
    },


    {
      label:'Under 3.5 First Half Corners',
      value:'UNDER_3_5',
    },


    {
      label:'Under 4.5 First Half Corners',
      value:'UNDER_4_5',
    },


  ],
},

// ==================================================
// FIRST HALF CARDS
// ==================================================

{
  label:'First Half Cards',
  value:PredictionMarkets.FIRST_HALF_CARDS,

  selections:[


    {
      label:'Over 0.5 First Half Cards',
      value:'OVER_0_5',
    },


    {
      label:'Over 1.5 First Half Cards',
      value:'OVER_1_5',
    },


    {
      label:'Over 2.5 First Half Cards',
      value:'OVER_2_5',
    },


    {
      label:'Under 0.5 First Half Cards',
      value:'UNDER_0_5',
    },


    {
      label:'Under 1.5 First Half Cards',
      value:'UNDER_1_5',
    },


    {
      label:'Under 2.5 First Half Cards',
      value:'UNDER_2_5',
    },


  ],
},

// ==================================================
// TOTAL OFFSIDES
// ==================================================

{
  label:'Total Offsides',
  value:PredictionMarkets.OFFSIDES_TOTAL,

  selections:[


    {
      label:'Over 1.5 Offsides',
      value:'OVER_1_5',
    },


    {
      label:'Over 2.5 Offsides',
      value:'OVER_2_5',
    },


    {
      label:'Over 3.5 Offsides',
      value:'OVER_3_5',
    },


    {
      label:'Over 4.5 Offsides',
      value:'OVER_4_5',
    },


    {
      label:'Under 1.5 Offsides',
      value:'UNDER_1_5',
    },


    {
      label:'Under 2.5 Offsides',
      value:'UNDER_2_5',
    },


    {
      label:'Under 3.5 Offsides',
      value:'UNDER_3_5',
    },


    {
      label:'Under 4.5 Offsides',
      value:'UNDER_4_5',
    },


  ],
},

// ==================================================
// TEAM OFFSIDES
// ==================================================

{
  label:'Team Offsides',
  value:PredictionMarkets.TEAM_OFFSIDES,

  selections:[


    {
      label:'Home Over 0.5 Offsides',
      value:'HOME_OVER_0_5',
    },


    {
      label:'Home Over 1.5 Offsides',
      value:'HOME_OVER_1_5',
    },


    {
      label:'Home Under 0.5 Offsides',
      value:'HOME_UNDER_0_5',
    },


    {
      label:'Home Under 1.5 Offsides',
      value:'HOME_UNDER_1_5',
    },


    {
      label:'Away Over 0.5 Offsides',
      value:'AWAY_OVER_0_5',
    },


    {
      label:'Away Over 1.5 Offsides',
      value:'AWAY_OVER_1_5',
    },


    {
      label:'Away Under 0.5 Offsides',
      value:'AWAY_UNDER_0_5',
    },


    {
      label:'Away Under 1.5 Offsides',
      value:'AWAY_UNDER_1_5',
    },


  ],
},

// ==================================================
// TOTAL FOULS
// ==================================================

{
  label:'Total Fouls',
  value:PredictionMarkets.FOULS_TOTAL,

  selections:[


    {
      label:'Over 20.5 Fouls',
      value:'OVER_20_5',
    },


    {
      label:'Over 25.5 Fouls',
      value:'OVER_25_5',
    },


    {
      label:'Over 30.5 Fouls',
      value:'OVER_30_5',
    },


    {
      label:'Over 35.5 Fouls',
      value:'OVER_35_5',
    },


    {
      label:'Under 20.5 Fouls',
      value:'UNDER_20_5',
    },


    {
      label:'Under 25.5 Fouls',
      value:'UNDER_25_5',
    },


    {
      label:'Under 30.5 Fouls',
      value:'UNDER_30_5',
    },


    {
      label:'Under 35.5 Fouls',
      value:'UNDER_35_5',
    },


  ],
},

// ==================================================
// TEAM FOULS
// ==================================================

{
  label:'Team Fouls',
  value:PredictionMarkets.TEAM_FOULS,

  selections:[


    {
      label:'Home Over 10.5 Fouls',
      value:'HOME_OVER_10_5',
    },


    {
      label:'Home Over 12.5 Fouls',
      value:'HOME_OVER_12_5',
    },


    {
      label:'Home Over 15.5 Fouls',
      value:'HOME_OVER_15_5',
    },


    {
      label:'Away Over 10.5 Fouls',
      value:'AWAY_OVER_10_5',
    },


    {
      label:'Away Over 12.5 Fouls',
      value:'AWAY_OVER_12_5',
    },


    {
      label:'Away Over 15.5 Fouls',
      value:'AWAY_OVER_15_5',
    },


  ],
},

// ==================================================
// BTTS + GOALS
// ==================================================

{
  label:'Both Teams To Score + Goals',
  value:PredictionMarkets.BTTS_GOALS,

  selections:[

    {
      label:'BTTS + Over 1.5 Goals',
      value:'BTTS_OVER_1_5',
    },

    {
      label:'BTTS + Over 2.5 Goals',
      value:'BTTS_OVER_2_5',
    },

    {
      label:'BTTS + Over 3.5 Goals',
      value:'BTTS_OVER_3_5',
    },

    {
      label:'BTTS + Under 2.5 Goals',
      value:'BTTS_UNDER_2_5',
    },

    {
      label:'BTTS + Under 3.5 Goals',
      value:'BTTS_UNDER_3_5',
    },

    {
      label:'BTTS Yes + Home Win',
      value:'BTTS_HOME_WIN',
    },

    {
      label:'BTTS Yes + Away Win',
      value:'BTTS_AWAY_WIN',
    },

    {
      label:'BTTS Yes + Draw',
      value:'BTTS_DRAW',
    },

  ],
},


// ==================================================
// EXACT GOALS
// ==================================================

{
  label:'Exact Goals',
  value:PredictionMarkets.EXACT_GOALS,

  selections:[

    {
      label:'0 Goals',
      value:'EXACT_0',
    },

    {
      label:'1 Goal',
      value:'EXACT_1',
    },

    {
      label:'2 Goals',
      value:'EXACT_2',
    },

    {
      label:'3 Goals',
      value:'EXACT_3',
    },

    {
      label:'4 Goals',
      value:'EXACT_4',
    },

    {
      label:'5 Goals',
      value:'EXACT_5',
    },

    {
      label:'6+ Goals',
      value:'EXACT_6_PLUS',
    },

  ],
},


];