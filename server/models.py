from sqlalchemy import Column, Integer, String
from database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_type = Column(String(50))
    vehicle_id = Column(Integer)
    start_date = Column(String(50))
    end_date = Column(String(50))