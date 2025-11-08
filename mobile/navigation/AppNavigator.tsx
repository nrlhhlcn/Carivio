import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../theme'

// Screens
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import HomeScreen from '../screens/HomeScreen'
import CVAnalysisScreen from '../screens/CVAnalysisScreen'
import InterviewScreen from '../screens/InterviewScreen'
import RankingScreen from '../screens/RankingScreen'
import ProfileScreen from '../screens/ProfileScreen'
import CommunityScreen from '../screens/CommunityScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: theme.colors.gray200,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'home'

          if (route.name === 'Home') {
            iconName = 'home'
          } else if (route.name === 'CVAnalysis') {
            iconName = 'description'
          } else if (route.name === 'Interview') {
            iconName = 'videocam'
          } else if (route.name === 'Ranking') {
            iconName = 'emoji-events'
          } else if (route.name === 'Community') {
            iconName = 'people'
          } else if (route.name === 'Profile') {
            iconName = 'person'
          }

          return <MaterialIcons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray500,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="CVAnalysis" 
        component={CVAnalysisScreen}
        options={{ title: 'CV Analizi' }}
      />
      <Tab.Screen 
        name="Interview" 
        component={InterviewScreen}
        options={{ title: 'Mülakat' }}
      />
      <Tab.Screen 
        name="Ranking" 
        component={RankingScreen}
        options={{ title: 'Sıralama' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{ title: 'Topluluk' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  // Loading durumunda boş View döndür (null yerine)
  if (loading === true) {
    return <React.Fragment />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

