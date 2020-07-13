#include<iostream>

using namespace std;

int f(int k)
{
	return (5 * (k - 'a') + 7) % 26 + 'a';
}

/*
	c = 5 * p + 7 
	5 * c = 25 * p + 35 = 35 - p 
	p = 35 - 5 * c
*/

int g(int k)
{
	return (35 - 5 * (k - 'a') + 26 * 26) % 26 + 'a';
}

int main()
{
	char s[] = "affine";
	for(int i = 0; i < 6; i++) cout << (char)f(s[i]);
	cout << endl;
	
	char t[] = "rveqbo";
	for(int i = 0; i < 6; i++) cout << (char)g(t[i]);
	cout << endl;	
}
