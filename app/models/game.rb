class Game < ApplicationRecord
  validates_presence_of :name
  has_many :characters, dependent: :destroy
end
