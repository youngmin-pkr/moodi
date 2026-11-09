import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

export default function Screen() {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>기록관리</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
});
