// Hooks.
import { useEffect, useState } from "react";
import { useThemeInfo } from "../../../hooks/Theme";
// Components.
import ProfileInputURL from "./ProfileInputURL";
import {
  Avatar,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Stack,
  Textarea,
} from "@chakra-ui/react";
// Icons.
import { FaImage, FaLink } from "react-icons/fa6";
// Countries
import countriesData from "../../../../public/countries.json";

// Component.
function ProfileFormBody({
  profile,
  register,
  errors,
  watch,
  reset,
  styles,
  isLoading,
}) {
  const { isDark } = useThemeInfo();

  // Countries.
  const [countries, setCountries] = useState(false);

  useEffect(() => {
    setCountries(countriesData["countries"]);
  }, []);

  // Country.
  const selectedCountry = watch("country");
  const [country, setCountry] = useState(profile.country);

  useEffect(() => {
    setCountry(selectedCountry);
  }, [selectedCountry]);

  // City.
  const [filteredCities, setFilteredCities] = useState(false);

  useEffect(() => {
    if (countries && country) {
      setFilteredCities(countries.find((c) => c.name === country)?.cities);
    } else {
      setFilteredCities(false);
    }
  }, [country, countries]);

  // Profile Picture.
  const selectedPicture = watch("profile_picture");

  const profilePicture =
    selectedPicture || selectedPicture === ""
      ? selectedPicture
      : profile.profile_picture;

  // Social Links.
  const socialLinks = [
    {
      label: "Website Link",
      name: "website_link",
      placeholder: "Enter your website URL.",
      default_value: profile.website_link,
    },
    {
      label: "Social Links",
      name: "social_link_one",
      placeholder: "Enter your social media URL.",
      default_value: profile.social_link_one,
    },
    {
      name: "social_link_two",
      placeholder: "Enter your social media URL.",
      default_value: profile.social_link_two,
    },
    {
      name: "social_link_three",
      placeholder: "Enter your social media URL.",
      default_value: profile.social_link_two,
    },
  ];

  return (
    <>
      <Stack textAlign="start" spacing={3}>
        <Flex w={"100%"} justifyContent={"space-between"}>
          <Flex justifyContent={"center"} alignItems={"center"} pr={"20px"}>
            <Avatar
              w={"190px"}
              h={"190px"}
              bg={"gray.400"}
              size="3xl"
              src={profilePicture}
            />
          </Flex>
          <Stack spacing={4} w={"100%"}>
            <HStack justifyContent={"center"}>
              {/* Name. */}
              <FormControl
                isDisabled={isLoading}
                isInvalid={errors.profile_name}
              >
                <FormLabel htmlFor="profile_name" fontWeight={"bold"}>
                  Name
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    {...register("profile_name", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters allowed.",
                      },
                      maxLength: {
                        value: 32,
                        message: "Maximum 32 characters allowed.",
                      },
                    })}
                    type="text"
                    defaultValue={profile.profile_name}
                    placeholder="Enter your name."
                    focusBorderColor={styles.focusBorderColor}
                  />
                  <InputRightElement width="auto" mx={"4px"}>
                    <FormControl>
                      <Select
                        size={"sm"}
                        {...register("pronouns")}
                        variant={"filled"}
                        defaultValue={profile.pronouns}
                        placeholder="Don't specify"
                      >
                        <option value="they/them">they/them</option>
                        <option value="she/her">she/her</option>
                        <option value="he/him">he/him</option>
                      </Select>
                    </FormControl>
                  </InputRightElement>
                </InputGroup>
                {/* Handle errors. */}
                {errors.profile_name && (
                  <FormErrorMessage>
                    {errors.profile_name.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            </HStack>

            {/* Bio. */}
            <FormControl isDisabled={isLoading} isInvalid={errors.bio}>
              <FormLabel htmlFor="bio" fontWeight={"bold"}>
                Biography
              </FormLabel>
              <Textarea
                {...register("bio", {
                  maxLength: {
                    value: 513,
                    message: "Maximum 513 characters allowed.",
                  },
                })}
                type="text"
                defaultValue={profile.bio}
                placeholder="Enter your biography."
                focusBorderColor={styles.focusBorderColor}
                resize={"none"}
              />
              {/* Handle errors. */}
              {errors.bio && (
                <FormErrorMessage>{errors.bio.message}</FormErrorMessage>
              )}
            </FormControl>
          </Stack>
        </Flex>

        {/* Profile picture. */}
        <ProfileInputURL
          register={register}
          label="Profile Picture"
          name="profile_picture"
          placeholder="Enter your image URL."
          defaultValue={profile.profile_picture}
          isLoading={isLoading}
          errors={errors}
          styles={styles}
          icon={<FaImage />}
        />

        {socialLinks.map((link, index) => (
          <ProfileInputURL
            key={index}
            register={register}
            label={link.label}
            name={link.name}
            placeholder={link.placeholder}
            defaultValue={link.default_value}
            isLoading={isLoading}
            errors={errors}
            styles={styles}
            icon={<FaLink />}
          />
        ))}

        {/* Country. */}
        {countries && (
          <FormControl isDisabled={isLoading} isInvalid={errors.country}>
            <FormLabel htmlFor="country" fontWeight={"bold"}>
              Country
            </FormLabel>
            <Select
              {...register("country")}
              defaultValue={profile.country}
              placeholder="Don't specify"
              focusBorderColor={styles.focusBorderColor}
              onChange={() => {
                reset({ city: "" });
              }}
            >
              {countries.map((country, index) => (
                <option key={index} value={country.name}>
                  {country.name}
                </option>
              ))}
            </Select>
            {/* Handle errors. */}
            {errors.country && (
              <FormErrorMessage>{errors.country.message}</FormErrorMessage>
            )}
          </FormControl>
        )}

        {/* City. */}
        {countries && country !== "" && (
          <FormControl isDisabled={isLoading} isInvalid={errors.city}>
            <FormLabel htmlFor="city" fontWeight={"bold"}>
              City
            </FormLabel>

            <Select
              {...register("city")}
              defaultValue={profile.city}
              placeholder="Don't specify"
              focusBorderColor={styles.focusBorderColor}
            >
              {filteredCities &&
                filteredCities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
            </Select>

            {/* Handle errors. */}
            {errors.city && (
              <FormErrorMessage>{errors.city.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      </Stack>
    </>
  );
}

export default ProfileFormBody;
