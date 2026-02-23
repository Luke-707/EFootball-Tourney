import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentApi, matchApi } from '../api';
import Navbar from '../components/Navbar';
import { Check, RefreshCw, Edit2, Play, Trophy } from 'lucide-react';

// ─── Layout constants ─────────────────────────────────────────────────────────
const CARD_W = 210;   // match card width (px)
const CARD_H = 74;    // match card height (px)
const COL_GAP = 60;    // connector zone between adjacent round columns (px)
const SLOT_H = 116;   // vertical slot height for round-1 matches (CARD_H + gap between matches)
const LABEL_H = 42;    // height reserved above cards for round label

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRoundLabel(roundNum, totalRounds) {
    const d = totalRounds - roundNum;
    if (d === 0) return 'Final';
    if (d === 1) return 'Semi-Final';
    if (d === 2) return 'Quarter-Final';
    if (d === 3) return 'Round of 16';
    if (d === 4) return 'Round of 32';
    return `Round ${roundNum}`;
}

/**
 * Computes the vertical center Y of every match in every round.
 * Round 1: matches are placed uniformly at SLOT_H intervals.
 * Later rounds: each match is centered between the two feeder matches.
 *
 * Returns  positions[roundNum] → [{ centerY, topY }]
 */
function computePositions(rounds, roundKeys) {
    const pos = {};
    roundKeys.forEach((rn, ri) => {
        pos[rn] = rounds[rn].map((_, mi) => {
            let cy;
            if (ri === 0) {
                cy = mi * SLOT_H + SLOT_H / 2;
            } else {
                const prev = pos[roundKeys[ri - 1]];
                const a = prev[2 * mi];
                const b = prev[2 * mi + 1];
                cy = a && b ? (a.centerY + b.centerY) / 2 : (a?.centerY ?? 0);
            }
            return { centerY: cy, topY: cy - CARD_H / 2 };
        });
    });
    return pos;
}

// ─── Bracket Match Card (display-only) ───────────────────────────────────────
const BkCard = ({ match, isCurrentRound }) => {
    if (!match) {
        return (
            <div className="bk-card bk-card--tbd">
                <div className="bk-row"><span className="bk-name bk-ghost">TBD</span></div>
                <div className="bk-sep" />
                <div className="bk-row"><span className="bk-name bk-ghost">TBD</span></div>
            </div>
        );
    }

    if (match.isBye) {
        return (
            <div className="bk-card bk-card--bye">
                <div className="bk-row bk-row--winner">
                    <span className="bk-name">{match.homeTeam?.name || '?'}</span>
                    <span className="bk-bye-pill">BYE</span>
                </div>
                <div className="bk-sep" />
                <div className="bk-row">
                    <span className="bk-name bk-ghost">—</span>
                </div>
            </div>
        );
    }

    const homeW = match.played && match.homeScore > match.awayScore;
    const awayW = match.played && match.awayScore > match.homeScore;

    return (
        <div className={[
            'bk-card',
            match.played ? 'bk-card--played' : '',
            isCurrentRound && !match.played ? 'bk-card--live' : '',
        ].join(' ')}>
            <div className={`bk-row ${homeW ? 'bk-row--winner' : match.played ? 'bk-row--loser' : ''}`}>
                <span className="bk-name">{match.homeTeam?.name || 'TBD'}</span>
                {match.played && (
                    <span className={`bk-score ${homeW ? 'bk-score--win' : ''}`}>{match.homeScore}</span>
                )}
            </div>
            <div className="bk-sep" />
            <div className={`bk-row ${awayW ? 'bk-row--winner' : match.played ? 'bk-row--loser' : ''}`}>
                <span className="bk-name">{match.awayTeam?.name || 'TBD'}</span>
                {match.played && (
                    <span className={`bk-score ${awayW ? 'bk-score--win' : ''}`}>{match.awayScore}</span>
                )}
            </div>
        </div>
    );
};

// ─── SVG Connectors ───────────────────────────────────────────────────────────
/**
 * Renders perfect 90-degree bracket connectors for one inter-round gap.
 *
 * For each match in `toPos` (next round), we need to connect the two feeder
 * matches from `fromPos`:
 *
 *   [fromPos[2i]]  ──────┐
 *                        │  (vertical)
 *                        ├──────────  [toPos[i]]
 *                        │
 *   [fromPos[2i+1]] ─────┘
 *
 * All coordinates are relative to the TOP of the content area (i.e. LABEL_H
 * has already been subtracted — positions are in "content space").
 */
const ConnectorSVG = ({ fromPos, toPos, contentH }) => {
    if (!fromPos || !toPos?.length) return null;

    const MID_X = COL_GAP / 2;        // x of the vertical bar
    const STROKE = 'rgba(0,255,136,0.38)';
    const SW = 1.5;

    return (
        <svg
            width={COL_GAP}
            height={contentH}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'visible',
                display: 'block',
                pointerEvents: 'none',
            }}
        >
            {toPos.map((tp, mi) => {
                const fa = fromPos[2 * mi];
                const fb = fromPos[2 * mi + 1];
                if (!fa) return null;

                const y1 = fa.centerY;
                const y2 = fb ? fb.centerY : y1;
                const my = tp.centerY;

                return (
                    <g key={mi} stroke={STROKE} strokeWidth={SW} fill="none" strokeLinecap="square">
                        {/* ── top feeder horizontal ── */}
                        <line x1="0" y1={y1} x2={MID_X} y2={y1} />
                        {/* ── bottom feeder horizontal ── */}
                        {fb && <line x1="0" y1={y2} x2={MID_X} y2={y2} />}
                        {/* ── vertical bridging bar ── */}
                        <line x1={MID_X} y1={y1} x2={MID_X} y2={y2} />
                        {/* ── exit horizontal to next round ── */}
                        <line x1={MID_X} y1={my} x2={COL_GAP} y2={my} />
                    </g>
                );
            })}
        </svg>
    );
};

// ─── Champion Panel ───────────────────────────────────────────────────────────
const ChampionPanel = ({ match, centerY }) => {
    if (!match?.played || match.isBye) return null;
    const winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
    const STUB = 28; // short line from final card to champion box

    return (
        <>
            {/* Stub line */}
            <svg
                width={STUB} height={2}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: LABEL_H + centerY - 1,
                    overflow: 'visible',
                    pointerEvents: 'none',
                }}
            >
                <line x1="0" y1="1" x2={STUB} y2="1"
                    stroke="rgba(0,255,136,0.38)" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
            {/* Box */}
            <div
                style={{
                    position: 'absolute',
                    left: STUB,
                    top: LABEL_H + centerY - 52,
                }}
                className="bk-champion"
            >
                <Trophy size={20} color="gold" />
                <div className="bk-champion-name">{winner?.name}</div>
            </div>
        </>
    );
};

// ─── The Full Visual Bracket ──────────────────────────────────────────────────
const KnockoutBracket = ({ rounds, latestRound }) => {
    const roundKeys = Object.keys(rounds).map(Number).sort((a, b) => a - b);
    if (!roundKeys.length) return null;

    const totalRounds = Math.max(...roundKeys);
    const pos = computePositions(rounds, roundKeys);

    // Canvas dimensions
    const allCY = Object.values(pos).flat().map(p => p.centerY);
    const contentH = Math.max(...allCY) + CARD_H / 2 + 40;
    const totalH = contentH + LABEL_H;
    const totalW = roundKeys.length * CARD_W + (roundKeys.length - 1) * COL_GAP + 160; // 160 for champ

    const CHAMP_COL_LEFT = roundKeys.length * (CARD_W + COL_GAP) - COL_GAP; // starts right after final column

    return (
        <div className="bk-scroll-box">
            <div style={{ position: 'relative', width: totalW, height: totalH, flexShrink: 0 }}>

                {roundKeys.map((rn, ri) => {
                    const colLeft = ri * (CARD_W + COL_GAP);
                    const isLatest = rn === latestRound;
                    const nextRound = roundKeys[ri + 1];
                    const hasNext = ri < roundKeys.length - 1;

                    return (
                        <div key={rn} style={{ position: 'absolute', left: colLeft, top: 0, width: CARD_W }}>

                            {/* ── Round label ── */}
                            <div className="bk-round-label">{getRoundLabel(rn, totalRounds)}</div>

                            {/* ── Match cards ── */}
                            {rounds[rn].map((match, mi) => (
                                <div
                                    key={match._id}
                                    style={{
                                        position: 'absolute',
                                        top: LABEL_H + pos[rn][mi].topY,
                                        width: CARD_W,
                                    }}
                                >
                                    <BkCard match={match} isCurrentRound={isLatest} />
                                </div>
                            ))}

                            {/* ── Connectors to next column ── */}
                            {hasNext && (
                                <div style={{
                                    position: 'absolute',
                                    left: CARD_W,
                                    top: LABEL_H,
                                    width: COL_GAP,
                                    height: contentH,
                                }}>
                                    <ConnectorSVG
                                        fromPos={pos[rn]}
                                        toPos={pos[nextRound]}
                                        contentH={contentH}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* ── Champion slot (after final) ── */}
                {(() => {
                    const finalRn = roundKeys[roundKeys.length - 1];
                    const finalMatch = rounds[finalRn]?.[0];
                    const finalCY = pos[finalRn]?.[0]?.centerY;
                    if (finalCY == null) return null;
                    return (
                        <div style={{
                            position: 'absolute',
                            left: CHAMP_COL_LEFT,
                            top: 0,
                            width: 160,
                        }}>
                            <div className="bk-round-label" style={{ color: 'gold' }}>Champion</div>
                            <ChampionPanel match={finalMatch} centerY={finalCY} />
                        </div>
                    );
                })()}

            </div>
        </div>
    );
};

// ─── Match List (league-style, used for both league + knockout result entry) ──
const MatchList = ({ rounds, editingMatch, scores, onStartEdit, onScoreChange, onRecord, latestRound, isKnockout }) => {
    const roundKeys = Object.keys(rounds).map(Number).sort((a, b) => a - b);
    // For knockout, show only the current (latest) round in the list
    const displayRounds = isKnockout ? roundKeys.filter(r => r === latestRound) : roundKeys;

    return (
        <>
            {displayRounds.map(rn => (
                <div key={rn} style={{ marginBottom: '2rem' }}>
                    {isKnockout
                        ? <h3 className="match-list-heading">
                            Current Round — {getRoundLabel(rn, Math.max(...roundKeys))}
                        </h3>
                        : <h3 className="match-list-heading">Round {rn}</h3>
                    }
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {rounds[rn]
                            .filter(m => !m.isBye)
                            .map(match => {
                                const isEditing = editingMatch === match._id;
                                const homeW = match.played && match.homeScore > match.awayScore;
                                const awayW = match.played && match.awayScore > match.homeScore;
                                return (
                                    <div key={match._id} className="ml-card">
                                        <div className={`ml-team ml-team--right ${homeW ? 'ml-winner' : ''}`}>
                                            {match.homeTeam.name}
                                        </div>

                                        <div className="ml-center">
                                            {isEditing ? (
                                                <div className="ml-input-row">
                                                    <input
                                                        type="number" min="0"
                                                        className="form-input ml-score-input"
                                                        value={scores.homeScore}
                                                        onChange={e => onScoreChange({ ...scores, homeScore: +e.target.value || 0 })}
                                                    />
                                                    <span className="ml-vs">–</span>
                                                    <input
                                                        type="number" min="0"
                                                        className="form-input ml-score-input"
                                                        value={scores.awayScore}
                                                        onChange={e => onScoreChange({ ...scores, awayScore: +e.target.value || 0 })}
                                                    />
                                                    <button className="btn btn-primary btn-sm-icon" onClick={() => onRecord(match._id)}>
                                                        <Check size={14} />
                                                    </button>
                                                </div>
                                            ) : match.played ? (
                                                <div className="ml-score-row">
                                                    <span className="ml-score">{match.homeScore} – {match.awayScore}</span>
                                                    <button
                                                        className="btn btn-ghost btn-sm-icon"
                                                        title="Edit result"
                                                        onClick={() => onStartEdit(match._id, match.homeScore, match.awayScore)}
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn-record-pill"
                                                    onClick={() => onStartEdit(match._id, 0, 0)}
                                                >
                                                    Record
                                                </button>
                                            )}
                                        </div>

                                        <div className={`ml-team ml-team--left ${awayW ? 'ml-winner' : ''}`}>
                                            {match.awayTeam.name}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ))}
        </>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const Fixtures = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);
    const [scores, setScores] = useState({ homeScore: 0, awayScore: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchTournament(); }, [id]);

    const fetchTournament = async () => {
        try {
            const res = await tournamentApi.getById(id);
            setTournament(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecord = async (matchId) => {
        try {
            await matchApi.recordResult(matchId, scores);
            setEditingMatch(null);
            fetchTournament();
        } catch (err) {
            alert(err.response?.data?.error || 'Error recording result');
        }
    };

    const handleClearFixtures = async () => {
        if (!window.confirm('Delete ALL fixtures and reset all stats?')) return;
        try { await tournamentApi.clearFixtures(id); fetchTournament(); }
        catch (err) { console.error(err); }
    };

    const handleNextRound = async () => {
        try { await tournamentApi.generateFixtures(id); fetchTournament(); }
        catch (err) { alert(err.response?.data?.error || 'Error advancing round'); }
    };

    const handleStartEdit = (matchId, home, away) => {
        setEditingMatch(matchId);
        setScores({ homeScore: home, awayScore: away });
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner" />
        </div>
    );
    if (!tournament) return <div style={{ padding: '2rem', color: 'var(--gray)' }}>Tournament not found.</div>;

    // Group matches by round
    const rounds = {};
    tournament.matches.forEach(m => {
        if (!rounds[m.round]) rounds[m.round] = [];
        rounds[m.round].push(m);
    });

    const roundKeys = Object.keys(rounds).map(Number);
    const latestRound = roundKeys.length > 0 ? Math.max(...roundKeys) : 0;
    const isKnockout = tournament.type === 'knockout';
    const totalRounds = roundKeys.length > 0 ? Math.max(...roundKeys) : 0;

    // Detect finished tournament
    const finalMatches = rounds[latestRound] || [];
    const isTournamentOver = isKnockout
        && finalMatches.length === 1
        && finalMatches[0]?.played
        && !finalMatches[0]?.isBye;

    // Detect if current round is fully played
    const currentRoundDone = (rounds[latestRound] || []).every(m => m.played);

    // Bye count info
    const byeCount = (rounds[1] || []).filter(m => m.isBye).length;

    return (
        <div>
            <Navbar tournamentId={id} tournamentType={tournament?.type} />

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="title" style={{ marginBottom: '0.2rem' }}>{tournament.name}</h1>
                    {isKnockout && byeCount > 0 && tournament.matches.length > 0 && (
                        <p className="page-meta">
                            🎟️ {byeCount} team{byeCount > 1 ? 's' : ''} received a first-round bye
                        </p>
                    )}
                    {isKnockout && (
                        <p className="page-meta page-meta--muted">
                            Draws → record score after extra time / penalties.
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    {isKnockout && tournament.matches.length > 0 && !isTournamentOver && (
                        <button className="btn btn-primary" onClick={handleNextRound}>
                            <Play size={15} /> Next Round
                        </button>
                    )}
                    {tournament.matches.length > 0 && (
                        <button className="btn btn-secondary" onClick={handleClearFixtures}>
                            <RefreshCw size={15} /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* ── Empty State ── */}
            {tournament.matches.length === 0 && (
                <div className="empty-state">
                    <Play size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No fixtures generated yet.</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.4rem' }}>
                        Go to the tournament page and click "Generate Fixtures".
                    </p>
                </div>
            )}

            {/* ── Knockout: Visual Bracket + Match List ── */}
            {isKnockout && tournament.matches.length > 0 && (
                <>
                    <KnockoutBracket rounds={rounds} latestRound={latestRound} />

                    {/* Match result entry — same list style as league */}
                    {!isTournamentOver && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <MatchList
                                rounds={rounds}
                                editingMatch={editingMatch}
                                scores={scores}
                                onStartEdit={handleStartEdit}
                                onScoreChange={setScores}
                                onRecord={handleRecord}
                                latestRound={latestRound}
                                isKnockout={true}
                            />
                        </div>
                    )}
                </>
            )}

            {/* ── League: just the match list ── */}
            {!isKnockout && tournament.matches.length > 0 && (
                <MatchList
                    rounds={rounds}
                    editingMatch={editingMatch}
                    scores={scores}
                    onStartEdit={handleStartEdit}
                    onScoreChange={setScores}
                    onRecord={handleRecord}
                    latestRound={latestRound}
                    isKnockout={false}
                />
            )}
        </div>
    );
};

export default Fixtures;
