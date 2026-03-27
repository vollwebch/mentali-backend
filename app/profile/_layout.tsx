import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        header: () => null,
        headerTransparent: true,
        headerBackVisible: false
      }}
    >
      <Stack.Screen 
        name="historial-publico" 
        options={{
          headerShown: false,
          header: () => null
        }}
      />
      <Stack.Screen 
        name="historial-privado" 
        options={{
          headerShown: false,
          header: () => null
        }}
      />
    </Stack>
  );
} 