// ============================================================
// TENFOLD LEGENDS: Rise of the Ten
// Google Apps Script Backend — Code.gs
// ------------------------------------------------------------
// HOW TO DEPLOY:
//   1. Open this project in Google Apps Script editor
//   2. Run setup() ONCE to auto-create all sheets
//   3. Click Deploy → New Deployment → Web App
//      • Execute as: Me
//      • Who has access: Anyone
//   4. Copy the Web App URL
//   5. Paste it into game.js  →  const API_URL = 'YOUR_URL';
// ============================================================

// ── ADMIN ACCOUNTS ────────────────────────────────────────────
// These accounts bypass all hero locks and have full access to every hero.
// Run seedAdmins() once from the Apps Script editor to insert them into the sheet.
var ADMIN_EMAILS = [
  'reyesko@gmail.com',   // SenjoAdmin
  'albertein@gmail.com'  // AlbertAdmin
];

/** Returns true if the given userID belongs to an admin account. */
function isAdminUser(ss, userID) {
  if (!userID) return false;
  var data = getData(ss.getSheetByName(SHEETS.USERS));
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === userID) {
      return ADMIN_EMAILS.indexOf(String(data[i][2]).toLowerCase()) !== -1;
    }
  }
  return false;
}

// ── SHEET NAMES ───────────────────────────────────────────────
var SHEETS = {
  USERS:       'Users',
  CHARACTERS:  'Characters',
  SCORES:      'Scores',
  LEADERBOARD: 'Leaderboard',
  STORY:       'StoryProgress',
  SESSIONS:    'Sessions'
};

// ── ENTRY POINTS ─────────────────────────────────────────────
function doGet(e)  { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  var output;
  var callback = (e && e.parameter && e.parameter.callback)
    ? String(e.parameter.callback).replace(/[^a-zA-Z0-9_$]/g, '')
    : '';

  try {
    initSheets();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
    var result = route(action, (e && e.parameter) || {});
    output = JSON.stringify(result);
  } catch (err) {
    output = JSON.stringify({ success: false, message: 'Server error: ' + err.message });
  }

  // JSONP is required for MIT App Inventor WebViewer because normal
  // fetch/XHR requests to Apps Script can fail due to browser CORS rules.
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + output + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

// ── ROUTER ────────────────────────────────────────────────────
function route(action, p) {
  switch (action) {
    case 'register':    return registerUser(p);
    case 'login':       return loginUser(p);
    case 'getScore':    return getScore(p);
    case 'addScore':    return addScore(p);
    case 'leaderboard': return getLeaderboard();
    case 'getStory':    return getStoryProgress(p);
    case 'saveStory':   return saveStoryProgress(p);
    case 'getChars':    return getCharacters(p);
    case 'unlockChar':  return unlockCharacter(p);
    case 'levelUp':     return levelUpCharacter(p);
    case 'setHeroLevel':return setHeroLevel(p);
    case 'ping':        return { success: true, message: 'Tenfold Legends API online!' };
    default:            return { success: false, message: 'Unknown action: ' + action };
  }
}

// ════════════════════════════════════════════════════════════
// SHEET AUTO-GENERATOR
// ════════════════════════════════════════════════════════════
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  createSheet(ss, SHEETS.USERS, [
    'UserID', 'Username', 'Email', 'Password',
    'CreatedAt', 'LastLogin', 'TotalScore'
  ]);

  createSheet(ss, SHEETS.CHARACTERS, [
    'UserID', 'HeroID', 'HeroName', 'Level', 'XP', 'Unlocked', 'UnlockedAt'
  ]);

  createSheet(ss, SHEETS.SCORES, [
    'ScoreID', 'UserID', 'Username', 'HeroID', 'HeroName',
    'EnemyHeroID', 'EnemyHeroName', 'Result', 'PointsEarned',
    'BattleDate', 'StoryChapter'
  ]);

  createSheet(ss, SHEETS.LEADERBOARD, [
    'Rank', 'UserID', 'Username', 'TotalScore',
    'Wins', 'Losses', 'WinRate', 'LastUpdated'
  ]);

  createSheet(ss, SHEETS.STORY, [
    'UserID', 'Chapter', 'Stage', 'Completed', 'CompletedAt', 'Stars'
  ]);

  createSheet(ss, SHEETS.SESSIONS, [
    'SessionID', 'UserID', 'Username', 'LoginTime', 'LastActive'
  ]);
}

function createSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;                       // already exists — skip

  sheet = ss.insertSheet(name);

  // Write headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style header row
  var hr = sheet.getRange(1, 1, 1, headers.length);
  hr.setBackground('#0f0f1e');
  hr.setFontColor('#f0c040');
  hr.setFontWeight('bold');
  hr.setFontSize(10);
  hr.setHorizontalAlignment('center');
  hr.setBorder(false, false, true, false, false, false,
               '#f0c040', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // Freeze header row
  sheet.setFrozenRows(1);

  // Auto-size columns
  for (var i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 160);
  }

  // Tab color by sheet
  var colors = {
    Users: '#e94560', Characters: '#f0c040', Scores: '#00cfff',
    Leaderboard: '#ff4500', StoryProgress: '#9932cc', Sessions: '#888888'
  };
  if (colors[name]) sheet.setTabColor(colors[name]);

  Logger.log('Created sheet: ' + name);
  return sheet;
}

// ════════════════════════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════════════════════════
function registerUser(p) {
  var username = trim(p.username);
  var email    = trim(p.email).toLowerCase();
  var password = trim(p.password);

  // Validate
  if (!username || !email || !password)
    return err('All fields are required.');
  if (username.length < 3)
    return err('Username must be at least 3 characters.');
  if (username.length > 20)
    return err('Username must be 20 characters or less.');
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    return err('Invalid email address.');
  if (password.length < 6)
    return err('Password must be at least 6 characters.');

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.USERS);
  var data  = getData(sheet);

  for (var i = 0; i < data.length; i++) {
    if (data[i][2] === email)
      return err('Email is already registered.');
    if (data[i][1].toString().toLowerCase() === username.toLowerCase())
      return err('Username is already taken.');
  }

  var userID = 'USR_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
  var now    = new Date().toISOString();
  var hashed = hashPw(password);

  sheet.appendRow([userID, username, email, hashed, now, now, 0]);
  initUserCharacters(ss, userID);

  return ok({ userID: userID, username: username, message: 'Account created!' });
}

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
function loginUser(p) {
  var email    = trim(p.email).toLowerCase();
  var password = trim(p.password);

  if (!email || !password) return err('Email and password are required.');

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.USERS);
  var data  = getData(sheet);
  var hashed = hashPw(password);

  for (var i = 0; i < data.length; i++) {
    if (data[i][2] === email && data[i][3] === hashed) {
      var row = i + 2; // +1 header, +1 1-indexed
      sheet.getRange(row, 6).setValue(new Date().toISOString()); // LastLogin

      var isAdmin = ADMIN_EMAILS.indexOf(email) !== -1;
      var sid = createSession(ss, data[i][0], data[i][1]);
      return ok({
        userID:     data[i][0],
        username:   data[i][1],
        totalScore: parseInt(data[i][6]) || 0,
        sessionID:  sid,
        isAdmin:    isAdmin,
        message:    'Login successful!'
      });
    }
  }
  return err('Invalid email or password.');
}

// ════════════════════════════════════════════════════════════
// SESSION
// ════════════════════════════════════════════════════════════
function createSession(ss, userID, username) {
  var sheet = ss.getSheetByName(SHEETS.SESSIONS);
  var sid   = 'SES_' + Date.now();
  var now   = new Date().toISOString();
  sheet.appendRow([sid, userID, username, now, now]);
  return sid;
}

// ════════════════════════════════════════════════════════════
// CHARACTER MANAGEMENT
// ════════════════════════════════════════════════════════════
var ALL_HEROES = [
  { id:'aeron',  name:'Aeron'  },
  { id:'lyra',   name:'Lyra'   },
  { id:'kael',   name:'Kael'   },
  { id:'riven',  name:'Riven'  },
  { id:'selene', name:'Selene' },
  { id:'draven', name:'Draven' },
  { id:'mira',   name:'Mira'   },
  { id:'orion',  name:'Orion'  },
  { id:'brutus', name:'Brutus' },
  { id:'elysia', name:'Elysia' }
];

function initUserCharacters(ss, userID, forceUnlockAll) {
  var sheet   = ss.getSheetByName(SHEETS.CHARACTERS);
  var now     = new Date().toISOString();

  // Build a set of heroIDs already recorded for this user to avoid duplicates
  var existing = getData(sheet);
  var existingHeroes = {};
  existing.forEach(function(row) {
    if (row[0] === userID) existingHeroes[row[1]] = true;
  });

  ALL_HEROES.forEach(function(h) {
    if (existingHeroes[h.id]) return; // already exists — skip
    var unlocked = (forceUnlockAll || h.id === 'aeron' || h.id === 'lyra') ? 'TRUE' : 'FALSE';
    sheet.appendRow([
      userID, h.id, h.name, 1, 0,
      unlocked,
      unlocked === 'TRUE' ? now : ''
    ]);
  });
}

function getCharacters(p) {
  var userID = trim(p.userID);
  if (!userID) return err('UserID required.');

  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var isAdmin = isAdminUser(ss, userID);
  var data    = getData(ss.getSheetByName(SHEETS.CHARACTERS));
  var chars   = [];

  data.forEach(function(row) {
    if (row[0] === userID) {
      chars.push({
        heroID:   row[1],
        heroName: row[2],
        level:    parseInt(row[3]) || 1,
        xp:       parseInt(row[4]) || 0,
        // Admins see every hero as unlocked regardless of sheet value
        unlocked: isAdmin ? true : (row[5] === 'TRUE' || row[5] === true)
      });
    }
  });

  // If no records yet (first login after deploy), init now
  if (chars.length === 0) {
    initUserCharacters(ss, userID, isAdmin);
    return getCharacters(p); // recurse once
  }

  // If admin but some heroes are still locked in the sheet, unlock them now
  if (isAdmin) {
    var sheet     = ss.getSheetByName(SHEETS.CHARACTERS);
    var sheetData = getData(sheet);
    var now = new Date().toISOString();
    for (var i = 0; i < sheetData.length; i++) {
      if (sheetData[i][0] === userID && (sheetData[i][5] !== 'TRUE' && sheetData[i][5] !== true)) {
        sheet.getRange(i + 2, 6).setValue('TRUE');
        sheet.getRange(i + 2, 7).setValue(now);
      }
    }
  }

  return ok({ characters: chars });
}

function unlockCharacter(p) {
  var userID = trim(p.userID);
  var heroID = trim(p.heroID);
  if (!userID || !heroID) return err('Missing params.');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHARACTERS);
  var data  = getData(sheet);

  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === userID && data[i][1] === heroID) {
      sheet.getRange(i + 2, 6).setValue('TRUE');
      sheet.getRange(i + 2, 7).setValue(new Date().toISOString());
      return ok({ message: heroID + ' unlocked!' });
    }
  }
  return err('Character record not found.');
}

function levelUpCharacter(p) {
  var userID = trim(p.userID);
  var heroID = trim(p.heroID);
  var xpGain = parseInt(p.xp) || 0;
  if (!userID || !heroID) return err('Missing params.');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHARACTERS);
  var data  = getData(sheet);

  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === userID && data[i][1] === heroID) {
      var lv = parseInt(data[i][3]) || 1;
      var xp = parseInt(data[i][4]) || 0;
      var leveled = false;

      xp += xpGain;
      while (xp >= lv * 100) {
        xp -= lv * 100;
        lv++;
        leveled = true;
      }

      sheet.getRange(i + 2, 4).setValue(lv);
      sheet.getRange(i + 2, 5).setValue(xp);
      return ok({ newLevel: lv, newXP: xp, leveledUp: leveled });
    }
  }
  return err('Character not found.');
}

// Force-set a hero's level and XP to the exact values the client has.
// Called after every battle to keep the server in sync with localStorage.
// Only updates if the new level is HIGHER than what's on the server,
// preventing accidental downgrades from stale data.
function setHeroLevel(p) {
  var userID   = trim(p.userID);
  var heroID   = trim(p.heroID);
  var newLevel = parseInt(p.level) || 1;
  var newXP    = parseInt(p.xp)    || 0;
  if (!userID || !heroID) return err('Missing params.');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHARACTERS);
  var data  = getData(sheet);

  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === userID && data[i][1] === heroID) {
      var serverLv = parseInt(data[i][3]) || 1;
      var serverXP = parseInt(data[i][4]) || 0;
      // Never downgrade progress. At the same level, keep the higher XP.
      var finalLv = Math.max(newLevel, serverLv);
      var finalXP = newLevel > serverLv ? newXP : (newLevel === serverLv ? Math.max(newXP, serverXP) : serverXP);
      if (finalLv !== serverLv || finalXP !== serverXP) {
        sheet.getRange(i + 2, 4).setValue(finalLv);
        sheet.getRange(i + 2, 5).setValue(finalXP);
      }
      return ok({ level: finalLv, xp: finalXP });
    }
  }
  return err('Character not found.');
}

// ════════════════════════════════════════════════════════════
// SCORES
// ════════════════════════════════════════════════════════════
function addScore(p) {
  var userID    = trim(p.userID);
  var username  = trim(p.username);
  var heroID    = trim(p.heroID);
  var heroName  = trim(p.heroName);
  var enemyID   = trim(p.enemyHeroID);
  var enemyName = trim(p.enemyName);
  var result    = trim(p.result);   // 'win' | 'lose'
  var chapter   = trim(p.chapter) || '0';

  if (!userID || !result) return err('Missing required params.');

  var points = (result === 'win') ? 100 : 10;
  var now    = trim(p.battleDate) || new Date().toISOString();
  var battleID = trim(p.battleID);
  var sid    = battleID || ('SCR_' + Date.now() + '_' + Math.floor(Math.random() * 100000));
  var ss     = SpreadsheetApp.getActiveSpreadsheet();
  var scoreSheet = ss.getSheetByName(SHEETS.SCORES);

  // Serialize score writes so two devices/browsers cannot read the same
  // old TotalScore and overwrite each other.
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Idempotency check INSIDE the lock — single authoritative check, no race condition.
    if (battleID) {
      var lockedExisting = getData(scoreSheet);
      for (var q = 0; q < lockedExisting.length; q++) {
        if (String(lockedExisting[q][0]) === battleID) {
          var lockedTotal = getScore(p);
          return ok({
            pointsEarned: 0,
            duplicate: true,
            newTotalScore: lockedTotal.success ? lockedTotal.totalScore : 0
          });
        }
      }
    }

    // Append score row
    scoreSheet.appendRow([
      sid, userID, username, heroID, heroName,
      enemyID, enemyName, result, points, now, chapter
    ]);

    // Update user TotalScore from the current authoritative sheet value.
    var uSheet = ss.getSheetByName(SHEETS.USERS);
    var uData  = getData(uSheet);
    var newTotal = points;
    for (var i = 0; i < uData.length; i++) {
      if (uData[i][0] === userID) {
        newTotal = (parseInt(uData[i][6]) || 0) + points;
        uSheet.getRange(i + 2, 7).setValue(newTotal);
        break;
      }
    }

    // XP for the hero used
    levelUpCharacter({ userID: userID, heroID: heroID, xp: points });

    // Rebuild leaderboard cache
    rebuildLeaderboard();

    return ok({ pointsEarned: points, newTotalScore: newTotal });
  } finally {
    lock.releaseLock();
  }
}

function getScore(p) {
  var userID = trim(p.userID);
  if (!userID) return err('UserID required.');

  var data = getData(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS));
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === userID) {
      return ok({ totalScore: parseInt(data[i][6]) || 0, username: data[i][1] });
    }
  }
  return err('User not found.');
}

// ════════════════════════════════════════════════════════════
// LEADERBOARD
// ════════════════════════════════════════════════════════════
function rebuildLeaderboard() {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var uData   = getData(ss.getSheetByName(SHEETS.USERS));
  var sData   = getData(ss.getSheetByName(SHEETS.SCORES));
  var lbSheet = ss.getSheetByName(SHEETS.LEADERBOARD);

  // Tally wins/losses per user
  var stats = {};
  sData.forEach(function(row) {
    var uid = row[1];
    if (!uid) return;
    if (!stats[uid]) stats[uid] = { wins: 0, losses: 0 };
    if (row[7] === 'win') stats[uid].wins++;
    else stats[uid].losses++;
  });

  // Build rows
  var rows = [];
  uData.forEach(function(row) {
    if (!row[0]) return;
    var uid  = row[0];
    var st   = stats[uid] || { wins: 0, losses: 0 };
    var tot  = st.wins + st.losses;
    var wr   = tot ? Math.round(st.wins / tot * 100) : 0;
    rows.push([
      0,                           // Rank (filled below)
      uid,                         // UserID
      row[1],                      // Username
      parseInt(row[6]) || 0,       // TotalScore
      st.wins,                     // Wins
      st.losses,                   // Losses
      wr + '%',                    // WinRate
      new Date().toISOString()     // LastUpdated
    ]);
  });

  // Sort by TotalScore desc, then Wins desc
  rows.sort(function(a, b) {
    if (b[3] !== a[3]) return b[3] - a[3];
    return b[4] - a[4];
  });
  rows.forEach(function(r, i) { r[0] = i + 1; });

  // Rewrite data rows (keep header at row 1)
  var last = lbSheet.getLastRow();
  if (last > 1) {
    lbSheet.getRange(2, 1, last - 1, 8).clearContent();
  }
  if (rows.length > 0) {
    lbSheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }
}

function getLeaderboard() {
  rebuildLeaderboard();
  var data = getData(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LEADERBOARD));
  var rows = [];
  data.forEach(function(row) {
    if (!row[1]) return;
    rows.push({
      rank:       parseInt(row[0]) || 0,
      userID:     row[1],
      username:   row[2],
      totalScore: parseInt(row[3]) || 0,
      wins:       parseInt(row[4]) || 0,
      losses:     parseInt(row[5]) || 0,
      winRate:    row[6] || '0%'
    });
  });
  return ok({ leaderboard: rows });
}

// ════════════════════════════════════════════════════════════
// STORY PROGRESS
// ════════════════════════════════════════════════════════════
function saveStoryProgress(p) {
  var userID  = trim(p.userID);
  var chapter = trim(p.chapter) || '1';
  var stage   = trim(p.stage)   || '1';
  var stars   = parseInt(p.stars) || 1;

  if (!userID) return err('UserID required.');

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.STORY);
  var data  = getData(sheet);
  var now   = new Date().toISOString();

  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === userID &&
        String(data[i][1]) === String(chapter) &&
        String(data[i][2]) === String(stage)) {
      // Update only if new stars are better
      if (stars > (parseInt(data[i][5]) || 0)) {
        sheet.getRange(i + 2, 4).setValue('TRUE');
        sheet.getRange(i + 2, 5).setValue(now);
        sheet.getRange(i + 2, 6).setValue(stars);
      }
      return ok({ message: 'Progress updated.' });
    }
  }

  // New entry
  sheet.appendRow([userID, chapter, stage, 'TRUE', now, stars]);
  return ok({ message: 'Progress saved.' });
}

function getStoryProgress(p) {
  var userID = trim(p.userID);
  if (!userID) return err('UserID required.');

  var data     = getData(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.STORY));
  var progress = [];

  data.forEach(function(row) {
    if (row[0] === userID) {
      progress.push({
        chapter:   row[1],
        stage:     row[2],
        completed: row[3] === 'TRUE' || row[3] === true,
        completedAt: row[4],
        stars:     parseInt(row[5]) || 0
      });
    }
  });

  return ok({ progress: progress });
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

/** Get all data rows (excluding header row 1) */
function getData(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
}

function trim(v) { return v ? String(v).trim() : ''; }

function ok(data) {
  return Object.assign({ success: true }, data || {});
}

function err(msg) {
  return { success: false, message: msg };
}

/** SHA-256 password hash */
function hashPw(password) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + '_tenfold_salt_2025'   // salted
  );
  return bytes.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

// ════════════════════════════════════════════════════════════
// SEED ADMINS — RUN ONCE FROM APPS SCRIPT EDITOR
// Creates SenjoAdmin and AlbertAdmin with all heroes unlocked.
// Safe to run multiple times — skips accounts that already exist.
// ════════════════════════════════════════════════════════════
function seedAdmins() {
  initSheets();
  var admins = [
    { username: 'SenjoAdmin',  email: 'reyesko@gmail.com',   password: 'joesenreyes1' },
    { username: 'AlbertAdmin', email: 'albertein@gmail.com',  password: 'albert123'   }
  ];

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.USERS);
  var data  = getData(sheet);
  var now   = new Date().toISOString();
  var created = [];
  var skipped = [];

  admins.forEach(function(admin) {
    var emailLower = admin.email.toLowerCase();

    // Check if already exists
    for (var i = 0; i < data.length; i++) {
      if (data[i][2] === emailLower) {
        skipped.push(admin.username);
        return;
      }
    }

    var userID = 'ADMIN_' + admin.username.toUpperCase() + '_' + Date.now();
    var hashed = hashPw(admin.password);

    sheet.appendRow([userID, admin.username, emailLower, hashed, now, now, 0]);

    // Re-fetch data so the recursive check in initUserCharacters works
    data = getData(sheet);

    // Unlock ALL heroes for admin
    initUserCharacters(ss, userID, true);
    created.push(admin.username + ' (' + admin.email + ')');
    Utilities.sleep(200); // avoid sheet write collisions
  });

  var msg = '';
  if (created.length)  msg += '✅ Created: ' + created.join(', ') + '\n';
  if (skipped.length)  msg += '⚠️ Already exists (skipped): ' + skipped.join(', ') + '\n';
  if (!created.length && !skipped.length) msg = 'No admins processed.';

  Logger.log(msg);
  SpreadsheetApp.getUi().alert('ADMIN SEED RESULT\n\n' + msg +
    '\nBoth admin accounts have ALL 10 heroes unlocked.\n' +
    'They can log in immediately at the game login page.');
}


// ════════════════════════════════════════════════════════════
// SETUP — RUN ONCE FROM APPS SCRIPT EDITOR
// ════════════════════════════════════════════════════════════
function setup() {
  initSheets();
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    '✅ Tenfold Legends Setup Complete!\n\n' +
    'All 6 sheets have been created:\n' +
    '• Users\n• Characters\n• Scores\n• Leaderboard\n• StoryProgress\n• Sessions\n\n' +
    'Next step: Deploy this project as a Web App and paste the URL into game.js'
  );
}

// ════════════════════════════════════════════════════════════
// DASHBOARD — VIEW-ONLY SUMMARY (run from editor for a report)
// ════════════════════════════════════════════════════════════
function dashboard() {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var uCount  = Math.max(0, ss.getSheetByName(SHEETS.USERS).getLastRow() - 1);
  var sCount  = Math.max(0, ss.getSheetByName(SHEETS.SCORES).getLastRow() - 1);
  var stCount = Math.max(0, ss.getSheetByName(SHEETS.STORY).getLastRow() - 1);

  var sData   = getData(ss.getSheetByName(SHEETS.SCORES));
  var wins    = sData.filter(function(r){ return r[7]==='win'; }).length;
  var losses  = sData.length - wins;

  Logger.log('===== TENFOLD LEGENDS DASHBOARD =====');
  Logger.log('Registered Players : ' + uCount);
  Logger.log('Total Battles      : ' + sCount);
  Logger.log('  Wins             : ' + wins);
  Logger.log('  Losses           : ' + losses);
  Logger.log('Story Records      : ' + stCount);
  Logger.log('=====================================');

  SpreadsheetApp.getUi().alert(
    'TENFOLD LEGENDS DASHBOARD\n\n' +
    'Players: ' + uCount + '\n' +
    'Battles: ' + sCount + ' (' + wins + 'W / ' + losses + 'L)\n' +
    'Story Records: ' + stCount
  );
}
