import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import StatsGrid from '../components/StatsGrid'
import { useStorage } from '../hooks/useStorage'
import SubscriptionsGrid from '../components/SubscriptionsGrid'

export default function Dashboard() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const { subscriptions, isLoading } = useStorage()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="header-title">SubSentry</h1>
        </div>
        <div className="header-right">
          {user && (
            <div className="user-menu">
              <img src={user.imageUrl || "/placeholder.svg"} alt={user.fullName || user.primaryEmailAddress?.emailAddress} className="user-avatar" />
              <div className="user-info">
                <p className="user-name">{user.fullName || user.primaryEmailAddress?.emailAddress}</p>
                <p className="user-email">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-content">
        <section className="welcome-section">
          <h2>Welcome back, {user?.fullName?.split(' ')[0] || user?.primaryEmailAddress?.emailAddress?.split('@')[0]}!</h2>
          <p className="welcome-subtitle">
            You're authenticated with {user?.primaryEmailAddress?.emailAddress}
          </p>
        </section>

        <section className="subscriptions-section">
          <div className="section-header">
            <h3>Your Subscriptions</h3>
            <button className="add-subscription-btn">+ Add Subscription</button>
          </div>

          {subscriptions && subscriptions.length > 0 ? (
            <SubscriptionsGrid
              subscriptions={subscriptions}
              layout="grid"
              onSubscriptionAction={(action, subscriptionId) => {
                console.log(`[v0] Subscription action: ${action} on ${subscriptionId}`)
              }}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 6v6m3-3H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h4>No subscriptions yet</h4>
              <p>Start by adding your first subscription to track</p>
            </div>
          )}
        </section>

        <section className="stats-dashboard">
          <div className="stats-header">
            <h2>Your Statistics</h2>
            <p className="stats-subtitle">
              Overview of your subscription spending and usage
            </p>
          </div>
          <StatsGrid subscriptions={subscriptions} isLoading={isLoading} />
        </section>
      </div>
    </main>
  )
}
