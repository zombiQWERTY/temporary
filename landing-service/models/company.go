package models

type User struct {
	Email     string `valid:"stringlength(3|100),email,required"`
	FirstName string `valid:"stringlength(2|20),required"`
	LastName  string `valid:"stringlength(2|20),required"`
	Password  string `valid:"stringlength(6|128),required"`
}

type Company struct {
	Name string `valid:"stringlength(2|62),required"`
}

type CompanyCreateRequest struct {
	User    User    `valid:"optional"`
	Company Company `valid:"optional"`
}
