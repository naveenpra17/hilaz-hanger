package com.hilazhanger.service;

import com.hilazhanger.domain.entity.UserAddress;
import com.hilazhanger.dto.AddressDtos;
import com.hilazhanger.repository.UserAddressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AddressService {

    private final UserAddressRepository addressRepository;

    public AddressService(UserAddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressDtos.AddressDto> list(UUID userId) {
        return addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public AddressDtos.AddressDto create(UUID userId, AddressDtos.AddressRequest req) {
        boolean makeDefault = req.defaultAddress() || addressRepository.countByUserId(userId) == 0;
        if (makeDefault) {
            clearDefault(userId);
        }
        UserAddress address = UserAddress.builder()
                .userId(userId)
                .label(req.label())
                .fullName(req.fullName())
                .phone(req.phone())
                .streetLine(req.streetLine())
                .city(req.city())
                .pincode(req.pincode())
                .defaultAddress(makeDefault)
                .build();
        return toDto(addressRepository.save(address));
    }

    @Transactional
    public AddressDtos.AddressDto update(UUID userId, UUID id, AddressDtos.AddressRequest req) {
        UserAddress address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.defaultAddress()) {
            clearDefault(userId);
        }
        address.setLabel(req.label());
        address.setFullName(req.fullName());
        address.setPhone(req.phone());
        address.setStreetLine(req.streetLine());
        address.setCity(req.city());
        address.setPincode(req.pincode());
        address.setDefaultAddress(req.defaultAddress());
        return toDto(addressRepository.save(address));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        UserAddress address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        addressRepository.delete(address);
    }

    private void clearDefault(UUID userId) {
        addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId)
                .forEach(a -> {
                    if (a.isDefaultAddress()) {
                        a.setDefaultAddress(false);
                        addressRepository.save(a);
                    }
                });
    }

    private AddressDtos.AddressDto toDto(UserAddress a) {
        return new AddressDtos.AddressDto(
                a.getId(), a.getLabel(), a.getFullName(), a.getPhone(),
                a.getStreetLine(), a.getCity(), a.getPincode(), a.isDefaultAddress());
    }
}
