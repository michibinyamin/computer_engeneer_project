import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ResetPassword from '../Components/ResetPassword'

// Mock Firebase reset function
jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
}))

// Mock Firebase config
jest.mock('../firebase', () => ({
  auth: {},
}))

// Mock alert
global.alert = jest.fn()

describe('ResetPassword screen', () => {
  const mockGoBack = jest.fn()

  const mockNavigation = {
    goBack: mockGoBack,
  }

  it('renders all input fields and buttons', () => {
    const { getByPlaceholderText, getByText } = render(
      <ResetPassword navigation={mockNavigation} />,
    )

    expect(getByPlaceholderText('Enter your email')).toBeTruthy()
    expect(getByText('Send Reset Link')).toBeTruthy()
    expect(getByText('Back to Login')).toBeTruthy()
  })

  it('allows user to type an email', () => {
    const { getByPlaceholderText } = render(
      <ResetPassword navigation={mockNavigation} />,
    )

    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'omar@example.com',
    )
  })

  it('shows alert if email is empty', () => {
    const { getByText } = render(<ResetPassword navigation={mockNavigation} />)
    fireEvent.press(getByText('Send Reset Link'))

    expect(global.alert).toHaveBeenCalledWith('Please enter your email.')
  })

  it('submits reset password request without crashing', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ResetPassword navigation={mockNavigation} />,
    )

    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'omar@example.com',
    )
    fireEvent.press(getByText('Send Reset Link'))

    await new Promise((res) => setTimeout(res, 0))

    expect(global.alert).toHaveBeenCalledWith(
      'Reset link sent! Check your inbox.',
    )
    expect(mockGoBack).toHaveBeenCalled()
  })

  it('navigates back when "Back to Login" is pressed', () => {
    const { getByText } = render(<ResetPassword navigation={mockNavigation} />)
    fireEvent.press(getByText('Back to Login'))

    expect(mockGoBack).toHaveBeenCalled()
  })
})
