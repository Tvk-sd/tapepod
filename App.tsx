import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Deck from './src/deck/Deck';
import { useMockPlayback } from './src/playback/useMockPlayback';
import { DeckSpec } from './src/reel-physics/reelPhysics';
import { useTape } from './src/tape-curation/useTape';
import { totalDuration } from './src/tape-curation/tape';
import TapeEditor from './src/tape-curation/TapeEditor';
import { MOCK_CATALOG, fmtDuration } from './src/catalog/mockCatalog';

// Deck geometry — hub vs. full-reel radii. Pure feel knobs.
const SPEC: DeckSpec = { hubRadius: 72, maxRadius: 150 };

// Map the tape's real runtime onto a watchable preview timescale (seconds).
const previewSeconds = (totalSec: number): number =>
  totalSec === 0 ? 30 : Math.max(10, Math.min(90, totalSec / 8));

export default function App() {
  const { width } = useWindowDimensions();
  const { tape, add, remove, full } = useTape();
  const { state, toggle } = useMockPlayback(SPEC, {
    durationSeconds: previewSeconds(totalDuration(tape)),
  });
  const [editing, setEditing] = useState(false);

  const deckWidth = Math.min(width - 32, 460);
  const loaded = tape.tracks.length > 0;

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

        {/* Deck — tap to pause/play */}
        <Pressable onPress={toggle}>
          <Deck
            width={deckWidth}
            spec={SPEC}
            progress={state.progress}
            supplyAngle={state.supplyAngle}
            takeupAngle={state.takeupAngle}
          />
        </Pressable>

        {/* Tape status + add songs */}
        <View style={styles.tapeRow}>
          <Text style={styles.tapeStatus}>
            {loaded
              ? `${tape.tracks.length}/20 · ${fmtDuration(totalDuration(tape))}`
              : 'no tape loaded'}
          </Text>
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
  screen: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  tapeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  tapeStatus: { color: '#777', fontSize: 13, letterSpacing: 1 },
  addBtn: {
    borderColor: '#E9E64B',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  addBtnText: { color: '#E9E64B', fontSize: 14, letterSpacing: 1 },
});
