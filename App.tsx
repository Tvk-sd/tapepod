import { useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Deck from './src/deck/Deck';
import { DeckSpec } from './src/reel-physics/reelPhysics';
import { useNowPlaying } from './src/now-playing/useNowPlaying';
import { createMockSource } from './src/now-playing/mockSource';
import { createSpotifySource } from './src/now-playing/spotifySource';
import { useSpotifyAuth } from './src/spotify/useSpotifyAuth';
import { useWebPlayback } from './src/spotify/useWebPlayback';
import { useTape } from './src/tape-curation/useTape';
import { totalDuration } from './src/tape-curation/tape';
import TapeEditor from './src/tape-curation/TapeEditor';
import { MOCK_CATALOG, fmtDuration } from './src/catalog/mockCatalog';

const SPEC: DeckSpec = { hubRadius: 72, maxRadius: 150 };

const previewSeconds = (totalSec: number): number =>
  totalSec === 0 ? 30 : Math.max(10, Math.min(90, totalSec / 8));

export default function App() {
  const { width } = useWindowDimensions();
  const { tape, add, remove, full } = useTape();
  const auth = useSpotifyAuth();
  const web = Platform.OS === 'web';
  const wp = useWebPlayback(auth.isAuthed, auth.getAccessToken);
  const [editing, setEditing] = useState(false);

  // Source switch: SDK player (control, web) > Spotify mirror (read) > mock.
  const source = useMemo(() => {
    if (auth.isAuthed && web && wp.ready) return wp.source;
    if (auth.isAuthed) return createSpotifySource(auth.getAccessToken);
    return createMockSource(previewSeconds(totalDuration(tape)));
  }, [auth.isAuthed, web, wp.ready, wp.source, auth.getAccessToken, tape]);

  const { state, toggle } = useNowPlaying(source, SPEC, wp.ready ? 400 : 2000);

  // Deck tap controls Spotify when we're the player, else just freezes the mock.
  const onDeckPress = () => (wp.ready ? wp.controls.toggle() : toggle());

  const deckWidth = Math.min(width - 32, 460);
  const loaded = tape.tracks.length > 0;

  const statusText = auth.isAuthed
    ? state.trackTitle
      ? `${state.trackTitle} — ${state.trackArtist}`
      : wp.ready
      ? 'press ▶ — have a song queued in Spotify'
      : 'connecting player…'
    : loaded
    ? `${tape.tracks.length}/20 · ${fmtDuration(totalDuration(tape))}`
    : 'no tape loaded';

  return (
    <View style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.headerRow}>
          <Text style={styles.deckId}>RTT-01</Text>
          <Text style={styles.state}>{state.isPlaying ? '▶ PLAY' : '❚❚ PAUSE'}</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>tape{'\n'}preview</Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Trap</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Mix</Text>
            </View>
          </View>
        </View>

        <Pressable onPress={onDeckPress}>
          <Deck
            width={deckWidth}
            spec={SPEC}
            progress={state.progress}
            supplyAngle={state.supplyAngle}
            takeupAngle={state.takeupAngle}
          />
        </Pressable>

        {wp.ready && (
          <View style={styles.transport}>
            <Pressable style={styles.tBtn} onPress={wp.controls.prev}>
              <Text style={styles.tBtnText}>⏮</Text>
            </Pressable>
            <Pressable style={styles.tBtnPlay} onPress={wp.controls.toggle}>
              <Text style={styles.tBtnPlayText}>{state.isPlaying ? '❚❚' : '▶'}</Text>
            </Pressable>
            <Pressable style={styles.tBtn} onPress={wp.controls.next}>
              <Text style={styles.tBtnText}>⏭</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.tapeRow}>
          <Text style={styles.tapeStatus} numberOfLines={1}>
            {statusText}
          </Text>
        </View>

        <View style={styles.buttonsRow}>
          {auth.isAuthed ? (
            <Pressable style={styles.ghostBtn} onPress={auth.logout}>
              <Text style={styles.ghostBtnText}>spotify ✓</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.spotifyBtn} onPress={auth.login} disabled={!auth.canPrompt}>
              <Text style={styles.spotifyBtnText}>connect spotify</Text>
            </Pressable>
          )}
          <Pressable style={styles.addBtn} onPress={() => setEditing(true)}>
            <Text style={styles.addBtnText}>{loaded ? 'edit tape' : '+ add songs'}</Text>
          </Pressable>
        </View>
      </View>

      <TapeEditor
        visible={editing}
        onClose={() => setEditing(false)}
        tape={tape}
        catalog={MOCK_CATALOG}
        full={full}
        onAdd={add}
        onRemove={remove}
      />

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B0B', alignItems: 'center', justifyContent: 'center' },
  frame: { width: '100%', maxWidth: 480, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  deckId: { color: '#D8D8D8', fontSize: 18, letterSpacing: 2, fontWeight: '600' },
  state: { color: '#888', fontSize: 12, letterSpacing: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: { color: '#F2F2F2', fontSize: 34, lineHeight: 36, fontWeight: '300', letterSpacing: 1 },
  pills: { flexDirection: 'row', gap: 8 },
  pill: {
    borderColor: '#3A3A3A',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  pillText: { color: '#CFCFCF', fontSize: 13 },
  transport: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    marginTop: 18,
  },
  tBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  tBtnText: { color: '#CFCFCF', fontSize: 20 },
  tBtnPlay: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderColor: '#E9E64B',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tBtnPlayText: { color: '#E9E64B', fontSize: 18 },
  tapeRow: { marginTop: 18 },
  tapeStatus: { color: '#777', fontSize: 13, letterSpacing: 1 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  spotifyBtn: {
    backgroundColor: '#1DB954',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  spotifyBtnText: { color: '#0B0B0B', fontSize: 14, letterSpacing: 1, fontWeight: '600' },
  ghostBtn: {
    borderColor: '#1DB954',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  ghostBtnText: { color: '#1DB954', fontSize: 14, letterSpacing: 1 },
  addBtn: {
    borderColor: '#E9E64B',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  addBtnText: { color: '#E9E64B', fontSize: 14, letterSpacing: 1 },
});
