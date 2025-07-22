import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import WelcomeScreen from '../Components/WelcomeScreen'

describe('WelcomeScreen', () => {
  const mockNavigate = jest.fn()
  const mockNavigation = { navigate: mockNavigate }

  it('renders all expected texts', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />)

    expect(getByText('Welcome to RecoMate')).toBeTruthy()
    expect(getByText('🌟 Discover personalized recommendations')).toBeTruthy()
    expect(getByText('👥 From real people in your community')).toBeTruthy()
    expect(getByText("🔍 Find hidden gems you'll love")).toBeTruthy()
    expect(getByText('💬 Share your own favorites')).toBeTruthy()
    expect(
      getByText(/RecoMate connects you with authentic recommendations/i),
    ).toBeTruthy()
    expect(getByText('Get Started')).toBeTruthy()
  })

  it('navigates to Register screen when "Get Started" is pressed', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />)
    fireEvent.press(getByText('Get Started'))
    expect(mockNavigate).toHaveBeenCalledWith('Register')
  })
})
