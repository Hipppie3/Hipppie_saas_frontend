import './DashboardStatCard.css';
import { FaTrophy, FaUsers, FaBasketballBall, FaCalendarAlt, FaUserFriends, FaChartBar } from 'react-icons/fa';

const iconMap = {
 Seasons: <FaCalendarAlt />,
 Leagues: <FaTrophy />,
 Teams: <FaUsers />,
 Players: <FaUserFriends />,
 Games: <FaBasketballBall />,
 Sports: <FaChartBar />
};

function DashboardStatCard({ title, count, onClick }) {
 return (
  <div className="stat_card" onClick={onClick}>
   <div className="stat_icon">{iconMap[title]}</div>
   <p className="stat_count">{count}</p>
   <h3 className="stat_title">{title}</h3>
  </div>
 );
}

export default DashboardStatCard;
