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

// Deck geometry — hub vs. full-reel radii. These are pure feel knobs: a smaller
// hub makes the reels swing through a wider size range as they wind.
const SPEC: DeckSpec = { hubRadius: 72, maxRadius: 150 };

export default function App() {
  const { width } = useWindowDimensions();
  const { state, toggle } = useMockPlayback(SPEC, { durationSeconds: 30 });

  // Constrain the deck to a phone-ish column even in a wide browser window.
  const deckWidth = Math.min(width - 32, 460);

  return (
    <Pressable style={styles.screen} onPress={toggle}>
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

        <Deck
          width={deckWidth}
          spec={SPEC}
          progress={state.progress}
          supplyAngle={state.supplyAngle}
          takeupAngle={state.takeupAngle}
        />

        <Text style={styles.hint}>tap anywhere to {state.isPlaying ? 'pause' : 'play'}</Text>
      </View>
      <StatusBar style="light" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  deckId: {
    color: '#D8D8D8',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: '600',
  },
  state: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    color: '#F2F2F2',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: 1,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    borderColor: '#3A3A3A',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  pillText: {
    color: '#CFCFCF',
    fontSize: 13,
  },
  hint: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: 1,
  },
});
