// import React, { useState } from 'react';
// import { View, Button } from 'react-native';
// import Tara3d from '@/components/Tara3d';

// export default function ChatScreen() {
//   const [state, setState] = useState<'Idle' | 'Talking' | 'Thinking' | 'Sad'>('Idle');

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Tara3d state={state} size={300} />

//       <Button title="Idle" onPress={() => setState('Idle')} />
//       <Button title="Talking" onPress={() => setState('Talking')} />
//       <Button title="Thinking" onPress={() => setState('Thinking')} />
//       <Button title="Sad" onPress={() => setState('Sad')} />
//     </View>
//   );
// }